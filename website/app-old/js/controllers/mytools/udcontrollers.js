/*
 * This file implements the upload file wizard. There are a number of controllers that
 * implement various pieces of the wizard. All data is saved using the Stater service.
 * Each controller appends its data to the state object. The object is created in the
 * initial controller: UploadFileController.
 *
 * Most of the steps in the wizard are separate controllers. There is a wizard service
 * that coordinates the controllers and fires an event to let a controller know that
 * its step is active. The wizard provides the method waitOn(scope, step, f) that a
 * controller calls to specify the step it is expecting. f is the function that will
 * be called when that step is activated.
 *
 * The UploadFileController is the master controller. It sets up the initial set of
 * steps for the wizard and is responsible for deciding whether a particular step is
 * active. The majority of the logic in this controller is concerned with step flow
 * and the actual upload process.
 *
 */

function UploadFileController($scope, wizard, mcapi, alertService, toUploadForm, Stater) {

    var steps = {
        step: 'nav_choose_project',
        children: [
            {step: 'nav_choose_process'},
            {step: 'nav_choose_inputs'},
            {
                step: 'nav_choose_outputs',
                children: [
                    {step:'nav_output_conditions'},
                    {step: 'nav_output_files'}
                ]
            },
            {step: 'nav_upload'}
        ]
    };

    wizard.setSteps(steps);

    Stater.newId("upload_file", "upload_file", "upload_file", function (status, state) {
        if (status) {
            $scope.state = state;
            $scope.state.attributes.process = {};
            $scope.state.attributes.process.name = "Process";
            wizard.fireStep('nav_choose_project');
        }
    });

    $scope.setCurrentStep = function (step) {
        if (step == 'nav_choose_process') {
            wizard.fireStep(step);
        } else if (step == 'nav_choose_inputs' || step == 'nav_choose_outputs') {
            wizard.fireStepAfter(step);
        } else if (!wizard.isAfterCurrentStep(step)) {
            wizard.fireStep(step);
        }
    }

    $scope.isCurrentStep = function (step) {
        return wizard.currentStep() == step;
    }

    $scope.isSubStepOf = function (step) {
        return wizard.isSubStepOf(step, wizard.currentStep());
    }

    $scope.upload = function () {
        if ($scope.state.attributes.output_files.length == 0) {
            // Handle case where there are no output files, but we still need to
            // create provenance
            return; // <-- **** Not correct ****
        }

        mcapi('/upload')
            .success(function () {
                Stater.clear();
                $scope.state = Stater.retrieve();
                alertService.sendMessage("Your file(s) were successfully uploaded.")
            })
            .error(function () {
                alertService.sendMessage("Sorry - Your files did not successfully upload.");
            })
            .post(
            {
                files: $scope.state.attributes.output_files,
                state_id: $scope.state.id
            }, {headers: {'Content-Type': false}, transformRequest: toUploadForm});
    }
}

/* ********************************************************************************************** */

function UploadWizardProjectStepController($scope, watcher, mcapi, Stater, wizard, alertService) {
    wizard.waitOn($scope, 'nav_choose_project', function () {
        $scope.state = Stater.retrieve();

        if ('project' in $scope.state.attributes) {
            $scope.project = $scope.state.attributes.project;
        }

        mcapi('/projects')
            .success(function (projects) {
                $scope.projects = projects;
            })
            .error(function (e) {
                alertService.sendMessage("Failure communicating with Materials Commons. Please try again later.");
            }).jsonp();
    });

    watcher.watch($scope, 'selected_project', function (projectname) {
        $scope.projectname = projectname;
        $scope.project = _.find($scope.projects, function (project) {
            return project.name == projectname;
        })
        $scope.state.attributes.project = $scope.project;
    });

    $scope.next = function () {
        Stater.persist($scope.state);
        wizard.fireNextStep();
    }
}

/* ********************************************************************************************** */

function UploadWizardProcessStepController($scope, wizard, watcher, mcapi, Stater, alertService) {
    $scope.uneditable_properties = [];
    var c = [
        'required_conditions', 'owner', 'birthtime', 'mtime', 'parent', 'notes',
        'inputs', 'outputs', 'runs', 'citations', 'status'
    ];

    c.forEach(function (name) {
        $scope.uneditable_properties[name] = "";
    });

    wizard.waitOn($scope, 'nav_choose_process', function () {
        $scope.state = Stater.retrieve();
        if ('process' in $scope.state.attributes) {
            $scope.process = $scope.state.attributes.process;
        }
        mcapi('/templates')
            .argWithValue('filter_by', '"template_type":"process"')
            .success(function (processes) {
                $scope.processes = processes;
            })
            .error(function () {
               alertService.sendMessage("Unable to retrieve processes from database.");
            }).jsonp();
    });

    watcher.watch($scope, 'selected_process', function (processname) {
        $scope.process = _.find($scope.processes, function (item) {

            return item.template_name == processname;
        });

        /*
         * Process is a template. All templates have a 'model' attribute that contains
         * a list of all the properties that are associated with the object they are
         * a template for.
         *
         * The code below pulls out the the property "required_conditions" which is a list
         * of the conditions that are required for this process. It then adds this attribute
         * into the process so we don't have to reconstruct this again.
         */

        $scope.process.name = $scope.process.template_name;
        var required_conditions_property = _.find($scope.process.model, function (prop) {
            return prop.name == "required_conditions";
        });

        $scope.process.required_conditions = required_conditions_property.value;
    });

    $scope.next = function () {
        /*
         * Add in new wizard steps for the conditions
         */
        $scope.process.required_conditions.forEach(function (condition) {
            var s = {step: condition};
            wizard.addStep('nav_choose_inputs', s);
        });
        wizard.addStep('nav_choose_inputs', {step: 'nav_input_files'});
        $scope.state.attributes.process = $scope.process;
        Stater.persist($scope.state);
        wizard.fireStepAfter('nav_choose_inputs');
    }
}

/* ********************************************************************************************** */

function UploadWizardConditionInputController($scope, mcapi, wizard, Stater, alertService) {
    $scope.init = function (condition_name) {
        $scope.condition_name = condition_name;
        var name = '"' + $scope.condition_name + '"';
        mcapi('/templates')
            .argWithValue('filter_by', '"template_name":' + name)
            .success(function (condition) {
                $scope.condition = condition[0];
            })
            .error(function () {
                alertService.sendMessage("Failed looking up: " + $scope.condition_name);
            }).jsonp();
    }

    wizard.waitOn($scope, $scope.condition_name, function () {
        $scope.state = Stater.retrieve();
        if ('input_conditions' in $scope.state.attributes) {
            if ($scope.condition_name in $scope.state.attributes.input_conditions) {
                $scope.condition = $scope.state.attributes.input_conditions[$scope.condition_name];
            }
        } else {
            $scope.state.attributes.input_conditions = {};
        }
    });

    $scope.save = function () {
        $scope.state = Stater.retrieve();
        if (! ('input_conditions' in $scope.state.attributes)) {
            $scope.state.attributes.input_conditions = {};
            Stater.save($scope.state);
        }
        $scope.state.attributes.input_conditions[$scope.condition_name] = $scope.condition;
        Stater.save($scope.state);
    }

    $scope.next = function () {
        Stater.persist($scope.state);
        wizard.fireNextStep();
    }
}

/* ********************************************************************************************** */

function UploadWizardFileInputController($scope, wizard, mcapi, Stater, alertService) {

    wizard.waitOn($scope, 'nav_input_files', function () {
        mcapi('/datadirs/tree/groups')
            .success(function (tree) {
                $scope.tree = tree;
            })
            .error(function () {
                alertService.sendMessage("Unable to retrieve a list of your files.")
            }).jsonp();
        $scope.state = Stater.retrieve();
        if (!('input_files' in $scope.state.attributes)) {
            $scope.state.attributes.input_files = [];
        }
    });

    $scope.addInputFile = function () {
        $scope.state.attributes.input_files.push($scope.selected_file);
    }

    $scope.chooseSelection = function (item) {
        if (item.type == "datafile") {
            $scope.selected_file = item;
        }
    }

    $scope.done = function () {
        Stater.persist($scope.state);
        wizard.fireStepAfter('nav_choose_outputs');
    }
}

/* ********************************************************************************************** */

function UploadWizardConditionOutputController($scope, mcapi, wizard, watcher, Stater, alertService) {

    $scope.init = function (condition_name) {
        $scope.condition_name = condition_name;
    }

    watcher.watch($scope, 'selected_condition', function (condition_name) {
        var name = '"' + condition_name + '"';
        mcapi('/templates')
            .argWithValue('filter_by', '"template_name":' + name)
            .success(function (condition) {
                $scope.condition = condition[0];
            })
            .error(function () {
                alertService.sendMessage("Failed looking up: " + $scope.condition_name);
            }).jsonp();
    });

    wizard.waitOn($scope, 'nav_output_conditions', function() {
        mcapi('/templates')
            .argWithValue('filter_by', '"template_type":"condition"')
            .success(function (conditions) {
                $scope.conditions = conditions;
            })
            .error(function () {
                alertService.sendMessage("Failed retrieving all condition templates");
            }).jsonp();
        $scope.state = Stater.retrieve();
        if (!('output_conditions' in $scope.state.attributes)) {
            $scope.state.attributes.output_conditions = {};
        }
    });

    $scope.next = function () {
        Stater.persist($scope.state);
        wizard.fireNextStep();
    }

    $scope.save = function () {
        $scope.state.attributes.output_conditions[$scope.condition_name] = $scope.condition;
    }
}

/* ********************************************************************************************** */

function UploadWizardFileOutputController($scope, wizard, mcapi, Stater, alertService) {
    wizard.waitOn($scope, 'nav_output_files', function () {
        $scope.state = Stater.retrieve();
        if (!('output_files' in $scope.state.attributes)) {
            $scope.state.attributes.output_files = [];
        }
        mcapi('/projectspage/%/datadirs/tree', $scope.state.attributes.project.id)
            .success(function (datadirs) {
                $scope.tree = datadirs;
            })
            .error(function () {
                alertService.sendMessage("Unable to retrieve your project.");
            }).jsonp();
    });

    $scope.chooseSelection = function (d) {
        $scope.selected_datadir = d;
    }

    $scope.addFile = function (element) {
        var obj = {};
        obj.file = element.files[0];
        obj.status = "Ready";
        obj.datadir = $scope.selected_datadir.name;
        $scope.state.attributes.output_files.push(obj);
    }

    $scope.done = function () {
        Stater.persist($scope.state);
        wizard.fireNextStep();
    }
}

/* ********************************************************************************************** */

function UploadDirectoryController($scope, mcapi) {
    $scope.files = [];
    $scope.percentage = 0;
    $scope.uploadurl = "notset";

    mcapi('/datadirs')
        .success(function (data) {
            $scope.datagroups = data;
        }).jsonp();
}

/* ********************************************************************************************** */

function UpDownLoadQueueController($scope, mcapi) {
    mcapi('/udqueue')
        .success(function (data) {
            $scope.udentries = data;
        }).jsonp();
}



