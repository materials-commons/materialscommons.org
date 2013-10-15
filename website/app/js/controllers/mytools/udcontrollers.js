function UploadFileController($scope, mcapi, User, formDataObject, pubsub, watcher) {
    $scope.show_project_panel = true;
    $scope.show_process_panel = false;

    $scope.show_inputs_panel = true;

    $scope.show_outputs_panel = false;
    $scope.project_panel_active = true;
    $scope.process_panel_active = false;

    $scope.inputs_panel_active = true;

    $scope.outputs_panel_active = false;
    $scope.process = "Process";
    $scope.required_conditions = [];

    watcher.watch($scope, 'selected_project', function (projectname) {
        pubsub.send('project_details', projectname);
    });

    watcher.watch($scope, 'selected_process', function (processname) {
        var p = _.find($scope.processes, function (item) {
            return item.name == processname;
        });
        pubsub.send('process_details', p);
    });

    watcher.watch($scope, 'selected_condition', function (conditionName) {
        var c = _.find($scope.conditions, function (condition) {
            return condition.template_name == conditionName;
        });
        pubsub.send('condition_details', c);
    });

    $scope.addInputFile = function () {
        var f = _.find($scope.input_files, function (file) {
            return file.name == $scope.selected_file;
        });
        pubsub.send('add_input_file', f);
    }

    $scope.projects = [
        {name: 'project1', id: 1},
        {name: 'project2', id: 2}
    ];

    $scope.useProject = function () {
        $scope.project = $scope.selected_project;
        $scope.show_project_panel = false;
        $scope.process_panel_active = true;
        $scope.show_process_panel = true;
    }

    $scope.doneAddingInputs = function() {
        $scope.show_inputs_panel = false;
        $scope.show_outputs_panel = true;
        $scope.outputs_panel_active = true;
    }

    $scope.processes = [
        {name: 'Run SEM', id: 1, description: 'Run the SEM and collect data', required_conditions: ['material_conditions', 'sem_equipment_conditions']},
        {name: 'Run APT', id: 2, description: 'Run the APT and collect data', required_conditions: ['material_conditions', 'apt_equipment_conditions']}
    ];

    $scope.useProcess = function () {
        $scope.process = $scope.selected_process;
        $scope.show_process_panel = false;
        $scope.inputs_panel_active = true;
        $scope.show_inputs_panel = true;
        var p = _.find($scope.processes, function (item) {
            return item.name == $scope.process;
        });

        $scope.required_conditions = p.required_conditions;

        pubsub.send("process_details", p);
    }

    $scope.useInputCondition = function () {
        $scope.show_edit_condition = true;
        var c = _.find($scope.conditions, function (condition) {
            return condition.template_name == $scope.selected_condition;
        });
        pubsub.send('edit_condition', c);
    }

    mcapi('/templates')
        .argWithValue('filter_by', '"template_type":"condition"')
        .success(function (conditions) {
            $scope.conditions = conditions;
        })
        .error(function (data) {
            console.log("/templates call failed")
        }).jsonp();

    $scope.input_files = [
        {id: 1, name: "sem_config.props", description: "Configuration properties for SEM"},
        {id: 2, name: "Al.jpg", description: "Picture of aluminum needle we scanned"}
    ];
}

function ProjectDetailsController($scope, pubsub) {
    pubsub.waitOn($scope, "project_details", function (projectName) {
        $scope.projectName = projectName;
    })
}

function ProcessDetailsController($scope, pubsub) {
    pubsub.waitOn($scope, "process_details", function (data) {
        $scope.process = data;
    });
}

function InputDetailsController($scope, pubsub) {
    pubsub.waitOn($scope, "condition_details", function (condition) {
        $scope.condition = condition;
    });
}

function OutputDetailsController($scope) {

}

function UploadProcessController($scope, pubsub) {
    $scope.conditions = [];
    pubsub.waitOn($scope, "add_condition", function (condition) {
        var condition_to_add = {};
        condition_to_add.name = condition.template_name;
        condition_to_add.ctype = condition.template_type;
        condition_to_add.properties = [];
        condition.model.forEach(function (item) {
            var obj = {};
            obj[item.name] = item.value;
            condition_to_add.properties.push(obj);
        });
        $scope.conditions.push(condition_to_add);
    });

    $scope.input_files = [];
    pubsub.waitOn($scope, "add_input_file", function (file) {
        console.log("add_input_file");
        var file_to_add = {};
        file_to_add.id = file.id;
        file_to_add.name = file.name;
        file_to_add.type = "file";
        $scope.input_files.push(file_to_add);
    });

    $scope.output_files = [];
}

function ConditionEditController($scope, pubsub) {
    pubsub.waitOn($scope, 'edit_condition', function (condition) {
        $scope.condition = condition;
    });

    $scope.addCondition = function () {
        pubsub.send('add_condition', $scope.condition);
        $scope.condition = null;
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

//$scope.uploadEachFile = function () {
//    if ($scope.files.length == 0) {
//        return;
//    }
//    $scope.files.forEach(function (fileEntry) {
//        console.dir(fileEntry);
//        if (fileEntry.status != "Uploaded") {
//            fileEntry.status = "Uploading...";
//            mcapi('/user/%/upload/%', User.u(), fileEntry.datagroup)
//                .success(function () {
//                    fileEntry.status = "Uploaded";
//                })
//                .error(function () {
//                    fileEntry.status = "Failed";
//                })
//                .post(
//                {
//                    file: fileEntry.file,
//                    material_condition: fileEntry.material_condition.id,
//                    equipment_condition: fileEntry.equipment_condition.id
//                },
//                {headers: {'Content-Type': false}, transformRequest: formDataObject});
//        }
//    });
//};
