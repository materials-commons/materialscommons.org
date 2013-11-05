/*
 * This file implements the upload file wizard. There are a number of controllers that
 * implement various pieces of the wizard. All data is saved using the Stater service.
 * Each controller appends its data to the state object. The object is created in the
 * initial controller: UploadFileController.
 *
 * Each controller is notified that it is the active controller by subscribing on a
 * channel in the pubsub service. There are just a couple of channels that are used.
 * The main channel which is used for each of the top level steps is the 'nav_set_step'
 * channel. The messages in this channel correspond to each of the top level steps in
 * the wizard. For example 'nav_choose_project' or 'nav_choose_process'. Some of these
 * wizard steps have small sub wizards embedded in them. These sub wizards communicate
 * using a different channel. For example the sub wizard related to collecting all the
 * process inputs 'input_condition_step'. The controllers related to this step wait on
 * this channel to discover they are active.
 *
 * The UploadFileController is the master overseer. It is both responsible for tracking
 * the steps through the wizard, and for
 *
 */

function UploadFileController($scope, pubsub, wizard, mcapi, User, toUploadForm, Stater) {

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
        console.dir($scope.state);
        if ($scope.state.attributes.output_files.length == 0) {
            // Handle case where there are no output files, but we still need to
            // create provenance
            return; // <-- **** Not correct ****
        }

        mcapi('/upload')
            .success(function () {
                console.log("Uploads succeeded")
                //fileEntry.status = "Uploaded";
            })
            .error(function () {
                console.log("Uploads failed");
                //fileEntry.status = "Failed";
            })
            .post(
            {
                files: $scope.state.attributes.output_files,
                state_id: $scope.state.id
            }, {headers: {'Content-Type': false}, transformRequest: toUploadForm});
    }
}

/* ********************************************************************************************** */

function UploadWizardProjectStepController($scope, watcher, mcapi, Stater, wizard) {
    wizard.waitOn($scope, 'nav_choose_project', function () {
        $scope.state = Stater.retrieve();

        if ('project' in $scope.state.attributes) {
            $scope.project = $scope.state.attributes.project;
        }

        mcapi('/projects')
            .success(function (projects) {
                $scope.projects = projects;
            })
            .error(function () {
                console.log("Unable to retrieve projects");
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

function UploadWizardProcessStepController($scope, wizard, watcher, mcapi, Stater) {
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
                console.log("Unable to retrieve processes from database.");
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

function UploadWizardConditionInputController($scope, mcapi, wizard, Stater) {
    $scope.init = function (condition_name) {
        $scope.condition_name = condition_name;
        var name = '"' + $scope.condition_name + '"';
        mcapi('/templates')
            .argWithValue('filter_by', '"template_name":' + name)
            .success(function (condition) {
                $scope.condition = condition[0];
            })
            .error(function () {
                console.log("Failed looking up: " + $scope.condition_name);
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

function UploadWizardFileInputController($scope, wizard, mcapi, Stater) {

    wizard.waitOn($scope, 'nav_input_files', function () {
        mcapi('/datadirs/tree/groups')
            .success(function (tree) {
                $scope.tree = tree;
            })
            .error(function () {
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

function UploadWizardConditionOutputController($scope, mcapi, wizard, watcher, Stater) {

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
                console.log("Failed looking up: " + $scope.condition_name);
            }).jsonp();
    });

    wizard.waitOn($scope, 'nav_output_conditions', function() {
        mcapi('/templates')
            .argWithValue('filter_by', '"template_type":"condition"')
            .success(function (conditions) {
                $scope.conditions = conditions;
            })
            .error(function () {
                console.log("Failed retrieving all condition templates");
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

function UploadWizardFileOutputController($scope, wizard, mcapi, Stater) {
    wizard.waitOn($scope, 'nav_output_files', function () {
        $scope.state = Stater.retrieve();
        if (!('output_files' in $scope.state.attributes)) {
            $scope.state.attributes.output_files = [];
        }
        mcapi('/projects/%/datadirs/tree', $scope.state.attributes.project.id)
            .success(function (datadirs) {
                $scope.tree = datadirs;
            })
            .error(function () {
                console.log("Unable to retrieve tree");
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



