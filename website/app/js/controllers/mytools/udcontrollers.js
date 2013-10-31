/*
 * This file implements the upload file wizard. There are a number of communicating controllers
 * used to implement the wizard. The controllers talk by sending messages to each other. The service
 * 'pubsub' is used for this communication. A controller that is interested in a message performs a
 * 'waitOn' on a particular named channel. Controllers that wish to communicate send messages to the
 * channel.
 *
 * The coordination of the upload is performed in the the 'UploadFileController'. This controller gathers
 * all the needed state attributes produced by the other controllers and performs the upload. This master
 * controller has a number 'waitOn' calls where it retrieves and stores the information needed to perform
 * the upload. The other controllers exist to gather the needed data and send it to this controller.
 *
 */

function UploadFileController($scope, pubsub, wizardSteps, mcapi, User, toUploadForm, Stater) {

    Stater.newId("upload_file", "upload_file", "upload_file", function (status, state) {
        if (status) {
            $scope.state = state;
            $scope.state.attributes.process = {};
            $scope.state.attributes.process.name = "Process";
        }
        $scope.setCurrentStep('nav_choose_project');
    });

    $scope.setCurrentStep = function (step) {
        wizardSteps.setCurrent('upload_wizard', step);
        pubsub.send('current_step', step);
    }

    $scope.isCurrentStep = function (step) {
        return wizardSteps.getCurrent('upload_wizard') == step;
    }

    $scope.setInputsCurrentStep = function (step) {
        wizardSteps.setCurrent('upload_inputs_wizard', step);
    }

    $scope.isInputsCurrentStep = function (step) {
        return wizardSteps.getCurrent('upload_inputs_wizard') == step;
    }

    $scope.setOutputsCurrentStep = function (step) {
        wizardSteps.setCurrent('upload_outputs_wizard', step);
    }

    $scope.isOutputsCurrentStep = function (step) {
        return wizardSteps.getCurrent('upload_outputs_wizard') == step;
    }

    //$scope.setOutputsCurrentStep('nav_output_conditions');

    pubsub.waitOn($scope, 'nav_set_step', function (step) {
        $scope.state = Stater.retrieve();
        $scope.setCurrentStep(step);
        if (step == 'nav_choose_inputs') {
            pubsub.send('input_condition_step', 'inputs_broadcast');
        }
    });

    pubsub.waitOn($scope, 'nav_step_inputs_next_by_index', function (next_by_index) {
        var required_conditions = $scope.state.process.required_conditions;
        if (next_by_index == required_conditions.length) {
            $scope.setInputsCurrentStep('nav_input_files');
        } else {
            $scope.setInputsCurrentStep(required_conditions[next_by_index]);
        }
    });

    pubsub.waitOn($scope, 'nav_step_outputs_next', function (step) {
        $scope.setOutputsCurrentStep(step);
    });

    $scope.input_conditions = [];
    pubsub.waitOn($scope, "add_input_condition", function (condition) {
        $scope.add_condition_to_list(condition, $scope.input_conditions);
    });

    $scope.output_conditions = [];
    pubsub.waitOn($scope, "add_output_condition", function (condition) {
        $scope.add_condition_to_list(condition, $scope.output_conditions);
    });

    pubsub.waitOn($scope, 'project_id', function (project_id) {
        $scope.project_id = project_id;
    });

    $scope.add_condition_to_list = function (condition, condition_list) {
        condition.name = condition.template_name;
        condition.ctype = condition.template_type;
        condition_list.push(condition);
    }

    $scope.input_files = [];
    pubsub.waitOn($scope, "add_input_file", function (file) {
        var file_to_add = {};
        file_to_add.id = file.id;
        file_to_add.name = file.name;
        file_to_add.type = "file";
        $scope.input_files.push(file_to_add);
    });

    $scope.output_files = [];
    pubsub.waitOn($scope, 'add_output_file', function (file) {
        $scope.output_files.push(file);
    });

    $scope.upload = function () {
        $scope.uploadAllItems();
    }

    $scope.uploadAllItems = function () {
        $scope.process.project = $scope.project_id;
        mcapi('/processes/from_template')
            .argWithValue('user', User.u())
            .success(function (p) {
                $scope.process_id = p.id;
                $scope.uploadConditions();
            })
            .error(function (e) {
                console.log("Saving process failed:" + e);
            }).post($scope.process);
    }

    $scope.uploadConditions = function () {
        $scope.input_conditions.forEach(function (condition) {
            condition.condition_type = "input_conditions";
            condition.process = $scope.process_id;
            condition.project = $scope.project_id;
        });

        $scope.output_conditions.forEach(function (condition) {
            condition.condition_type = "output_conditions";
            condition.process = $scope.process_id;
            condition.project = $scope.project_id;
        });

        var obj = {};
        obj.input_conditions = $scope.input_conditions;
        obj.output_conditions = $scope.output_conditions;
        mcapi('/conditions/from_template_list')
            .success(function () {
                $scope.uploadInputFiles();
            })
            .error(function () {
                console.log("condition save failed")
            }).post(obj);
    }

    $scope.uploadInputFiles = function () {
        var input_file_ids = [];

        $scope.input_files.forEach(function (f) {
            input_file_ids.push(f.id);
        });

        mcapi('/processes/%/update', $scope.process_id)
            .success(function () {
                $scope.uploadOutputFiles();
            })
            .error(function () {
                console.log("input file update failed");
            }).put({input_files: input_file_ids});
    }

    $scope.uploadOutputFiles = function () {
        if ($scope.output_files.length == 0) {
            return;
        }

        mcapi('/upload')
            .success(function () {
                //fileEntry.status = "Uploaded";
            })
            .error(function () {
                //fileEntry.status = "Failed";
            })
            .post(
            {
                files: $scope.output_files,
                process_id: $scope.process_id,
                project_id: $scope.project_id
            }, {headers: {'Content-Type': false}, transformRequest: toUploadForm});
    }
}

/* ********************************************************************************************** */

function UploadWizardProjectStepController($scope, pubsub, watcher, mcapi, Stater) {
    pubsub.waitOn($scope, 'current_step', function (step) {
        if (step == 'nav_choose_project') {
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
        }
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
        pubsub.send('nav_set_step', 'nav_choose_process');
    }
}

/* ********************************************************************************************** */

function UploadWizardProcessStepController($scope, pubsub, watcher, mcapi, Stater) {
    $scope.uneditable_properties = [];
    var c = [
        'required_conditions', 'owner', 'birthtime', 'mtime', 'parent', 'notes',
        'inputs', 'outputs', 'runs', 'citations', 'status'
    ];

    c.forEach(function (name) {
        $scope.uneditable_properties[name] = "";
    });

    pubsub.waitOn($scope, 'current_step', function (step) {
        if (step == 'nav_choose_process') {
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
        }
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
        $scope.state.attributes.process = $scope.process;
        Stater.persist($scope.state);
        pubsub.send('nav_set_step', 'nav_choose_inputs');
    }
}

/* ********************************************************************************************** */

function UploadWizardConditionInputController($scope, mcapi, pubsub, Stater) {
    $scope.init = function (condition_name) {
        console.log("Initializing UPloadWizardConditionInputController: " + condition_name);
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
        pubsub.send('input_condition_step', 'inputs_broadcast');
    }

    pubsub.waitOn($scope, 'input_condition_step', function (step) {
        console.log("got input_condition_step");
        $scope.state = Stater.retrieve();
        if ('input_conditions' in $scope.state.attributes) {
            if ($scope.condition_name in $scope.state.attributes.input_conditions) {
                console.log("found " + $scope.condition_name + " in input_conditions");
            }
        } else {
            console.log("adding input_conditions to attributes")
            $scope.state.attributes.input_conditions = [];
        }
        console.dir($scope.state);
    })

//    pubsub.waitOn($scope, 'current_step', function (step) {
//        if (step == 'nav_choose_inputs') {
//            $scope.state = Stater.retrieve();
//            if ('input_conditions' in $scope.state.attributes) {
//                $scope.input_conditions = $scope.state.attributes.input_conditions;
//            } else {
//                $scope.input_conditions = [];
//                $scope.state.attributes.input_conditions = $scope.input_conditions;
//            }
//        }
//    });

    $scope.save = function () {
        $scope.state.attributes.input_conditions[$scope.condition_name] = $scope.condition;
        console.dir($scope.state);
    }

    $scope.next = function (index) {
        Stater.save($scope.state);
        pubsub.send('nav_step_inputs_next_by_index', index + 1);
    }
}

/* ********************************************************************************************** */

function UploadWizardFileInputController($scope, pubsub, mcapi) {

    mcapi('/datadirs/tree/groups')
        .success(function (tree) {
            $scope.tree = tree;
        })
        .error(function () {
        }).jsonp();

    $scope.addInputFile = function () {
        pubsub.send('add_input_file', $scope.selected_file);
    }

    $scope.chooseSelection = function (item) {
        if (item.type == "datafile") {
            $scope.selected_file = item;
        }
    }

    $scope.done = function () {
        pubsub.send('nav_set_step', 'nav_choose_outputs');
    }
}

/* ********************************************************************************************** */

function UploadWizardFileOutputController($scope, pubsub, mcapi) {
    pubsub.waitOn($scope, 'project_id', function (project_id) {
        mcapi('/projects/%/datadirs/tree', project_id)
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
        $scope.$apply(function () {
            var obj = {};
            obj.file = element.files[0];
            obj.status = "Ready";
            obj.datadir = $scope.selected_datadir.name;
            pubsub.send('add_output_file', obj);
        });
    }

    $scope.done = function () {
        pubsub.send('nav_set_step', 'nav_upload');
    }
}

/* ********************************************************************************************** */

function UploadWizardConditionOutputController($scope, mcapi, pubsub, watcher) {

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

    mcapi('/templates')
        .argWithValue('filter_by', '"template_type":"condition"')
        .success(function (conditions) {
            $scope.conditions = conditions;
        })
        .error(function () {
            console.log("Failed retrieving all condition templates");
        }).jsonp();

    $scope.next = function (step) {
        pubsub.send('nav_step_outputs_next', 'nav_output_files');
    }

    $scope.save = function () {
        pubsub.send('add_output_condition', $scope.condition);
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



