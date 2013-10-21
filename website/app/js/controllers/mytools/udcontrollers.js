function UploadFileController($scope, pubsub, wizardSteps, mcapi, User, formDataObject) {
    $scope.process_name = "Process";
    $scope.required_conditions = [];

    $scope.setCurrentStep = function (step) {
        wizardSteps.setCurrent('upload_wizard', step);
    }

    $scope.setCurrentStep('nav_choose_project');

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

    $scope.setOutputsCurrentStep('nav_output_conditions')

    pubsub.waitOn($scope, 'nav_set_step', function (step) {
        $scope.setCurrentStep(step);
    });

    pubsub.waitOn($scope, 'set_project', function (project) {
        $scope.project = project;
    });

    pubsub.waitOn($scope, 'set_process', function (process) {
        $scope.process = process;
        $scope.process_name = process.name;
        $scope.required_conditions = process.required_conditions;
        if ($scope.required_conditions && $scope.required_conditions.length > 0) {
            $scope.nav_step_inputs = $scope.required_conditions[0];
        }
    });

    pubsub.waitOn($scope, 'nav_step_inputs_next_by_index', function (next_by_index) {
        if (next_by_index == $scope.required_conditions.length) {
            $scope.setInputsCurrentStep('nav_input_files');
        } else {
            $scope.setInputsCurrentStep($scope.required_conditions[next_by_index]);
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
        mcapi('/user/%/conditions/from_template_list', User.u())
            .success(function () {
                $scope.uploadFiles();
            })
            .error(function () {
                console.log("condition save failed")
            }).post(obj);
    }

    $scope.uploadFiles = function () {
        if ($scope.output_files.length == 0) {
            return;
        }
        $scope.output_files.forEach(function (fileEntry) {
            if (fileEntry.status != "Uploaded") {
                fileEntry.status = "Uploading...";
                mcapi('/user/%/upload/%', User.u(), fileEntry.datadir)
                    .success(function () {
                        fileEntry.status = "Uploaded";
                    })
                    .error(function () {
                        fileEntry.status = "Failed";
                    })
                    .post(
                        {
                            file: fileEntry.file,
                            process_id: $scope.process_id,
                            project_id: $scope.project_id
                        }, {headers: {'Content-Type': false}, transformRequest: formDataObject});
            }
        });
    }
}

function UploadWizardProjectStepController($scope, pubsub, watcher, mcapi, User) {

    mcapi('/user/%/projects', User.u())
        .success(function (projects) {
            $scope.projects = projects;
        })
        .error(function () {
            console.log("Unable to retrieve projects");
        }).jsonp();

    watcher.watch($scope, 'selected_project', function (projectname) {
        $scope.projectname = projectname;
        $scope.project = _.find($scope.projects, function (project) {
            return project.name == projectname;
        })
    });

    $scope.next = function () {
        pubsub.send('set_project', $scope.projectname);
        pubsub.send('nav_set_step', 'nav_choose_process');
        pubsub.send('project_id', $scope.project.id);
    }
}

function UploadWizardProcessStepController($scope, pubsub, watcher, mcapi) {
    $scope.uneditable_properties = [];
    var c = [
        'required_conditions', 'owner', 'birthtime', 'mtime', 'parent', 'notes',
        'inputs', 'outputs', 'runs', 'citations', 'status'
    ];

    c.forEach(function (name) {
        $scope.uneditable_properties[name] = "";
    });

    mcapi('/templates')
        .argWithValue('filter_by', '"template_type":"process"')
        .success(function (processes) {
            $scope.processes = processes;
        })
        .error(function () {
            console.log("Unable to retrieve processes from database.");
        }).jsonp();

    watcher.watch($scope, 'selected_process', function (processname) {
        $scope.process = _.find($scope.processes, function (item) {
            return item.template_name == processname;
        });

        $scope.process.name = $scope.process.template_name;
        var required_conditions_property = _.find($scope.process.model, function (prop) {
            return prop.name == "required_conditions";
        });

        $scope.process.required_conditions = required_conditions_property.value;
    });

    $scope.next = function () {
        pubsub.send('nav_set_step', 'nav_choose_inputs');
        pubsub.send('set_process', $scope.process);
    }
}

function UploadWizardConditionInputController($scope, mcapi, pubsub, wizardSteps) {
    $scope.init = function (condition_name) {
        $scope.condition_name = condition_name;
        wizardSteps.setCurrent('upload_inputs_wizard', $scope.required_conditions[0]);

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

    $scope.save = function () {
        pubsub.send('add_input_condition', $scope.condition);
    }

    $scope.next = function (index) {
        pubsub.send('nav_step_inputs_next_by_index', index + 1);
    }
}

function UploadWizardFileInputController($scope, pubsub) {
    $scope.input_files = [
//        {id: 1, name: "sem_config.props", description: "Configuration properties for SEM"},
//        {id: 2, name: "Al.jpg", description: "Picture of aluminum needle we scanned"}
    ];

    $scope.addInputFile = function () {
        var f = _.find($scope.input_files, function (file) {
            return file.name == $scope.selected_file;
        });
        pubsub.send('add_input_file', f);
    }

    $scope.done = function () {
        pubsub.send('nav_set_step', 'nav_choose_outputs');
    }
}

function UploadWizardFileOutputController($scope, pubsub, mcapi, watcher, User) {
    pubsub.waitOn($scope, 'project_id', function (project_id) {
        mcapi('/user/%/projects/%/datadirs', User.u(), project_id)
            .success(function (datadirs) {
                $scope.datadirs = datadirs;
            })
            .error(function () {
                console.log("Unable to retrieve tree");
            }).jsonp();
    });

    $scope.addFile = function (element) {
        $scope.$apply(function () {
            var obj = {};
            obj.file = element.files[0];
            obj.status = "Ready";
            obj.datadir = $scope.selected_datadir;
            pubsub.send('add_output_file', obj);
        });
    }

    $scope.done = function () {
        pubsub.send('nav_set_step', 'nav_upload');
    }
}

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

function UploadDirectoryController($scope, mcapi, User) {
    $scope.files = [];
    $scope.percentage = 0;
    $scope.uploadurl = "notset";

    mcapi('/user/%/datadirs', User.u())
        .success(function (data) {
            $scope.datagroups = data;
        }).jsonp();
}

function UpDownLoadQueueController($scope, mcapi, User) {
    mcapi('/user/%/udqueue', User.u())
        .success(function (data) {
            $scope.udentries = data;
        }).jsonp();
}



