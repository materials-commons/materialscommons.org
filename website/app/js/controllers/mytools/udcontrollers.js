function UploadFileController($scope, mcapi, User, formDataObject, pubsub, watcher) {
    $scope.show_project_panel = true;
    $scope.show_process_panel = false;
    $scope.show_inputs_panel = false;
    $scope.show_outputs_panel = false;
    $scope.project_panel_active = true;
    $scope.process_panel_active = false;
    $scope.inputs_panel_active = false;
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
        console.log("selected_condition = " + conditionName);
        var c = _.find($scope.conditions, function (condition) {
            return condition.template_name == conditionName;
        });
        pubsub.send('condition_details', c);
    });

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

    $scope.useInputCondition = function() {
        $scope.show_edit_condition = true;
        var c = _.find($scope.conditions, function (condition) {
            return condition.template_name == $scope.selected_condition;
        });
        console.dir(c);
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

function UploadProcessController($scope) {

}

function ConditionEditController($scope, pubsub) {
    pubsub.waitOn($scope, 'edit_condition', function(condition) {
        $scope.condition = condition;
    });
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
