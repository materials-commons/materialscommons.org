function UploadFileController($scope, mcapi, User, formDataObject, $rootScope, pubsub) {
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

    $scope.$watch('selected_project', function(newval, oldval) {
        var obj = {};
        obj.val1 = oldval;
        obj.val2 = newval;
        pubsub.send("project", obj);
    });

    $scope.projects = [
        {name:'project1', id:1},
        {name:'project2', id:2}
    ];

    $scope.useProject = function() {
        $scope.project = $scope.selected_project;
        $scope.show_project_panel = false;
        $scope.process_panel_active = true;
        $scope.show_process_panel = true;
    }

    $scope.processes = [
        {name: 'process1', id:1, required_conditions: ['equipment', 'material']},
        {name: 'process2', id:2, required_conditions: ['equipment', 'material', 'allisonlab', 'papers']}
    ];

    $scope.useProcess = function() {
        $scope.process = $scope.selected_process;
        $scope.show_process_panel = false;
        $scope.inputs_panel_active = true;
        $scope.show_inputs_panel = true;
        $scope.required_conditions = _.find($scope.processes, function(item) {
            return item.name == $scope.process;

        }).required_conditions;
    }

    mcapi('/templates')
        .arg('filter_by="template_type":"condition"')
        .success(function(data) {
            //console.dir(data);
        })
        .error(function(data) {
            //console.log("/templates call failed")
        }).jsonp();

    $scope.uploadEachFile = function () {
        if ($scope.files.length == 0) {
            return;
        }
        $scope.files.forEach(function (fileEntry) {
            console.dir(fileEntry);
            if (fileEntry.status != "Uploaded") {
                fileEntry.status = "Uploading...";
                mcapi('/user/%/upload/%', User.u(), fileEntry.datagroup)
                    .success(function () {
                        fileEntry.status = "Uploaded";
                    })
                    .error(function () {
                        fileEntry.status = "Failed";
                    })
                    .post(
                        {
                            file: fileEntry.file,
                            material_condition: fileEntry.material_condition.id,
                            equipment_condition: fileEntry.equipment_condition.id
                        },
                        {headers: {'Content-Type': false}, transformRequest: formDataObject});
            }
        });
    };
}

function ProjectDetailsController($scope, mcapi, User, pubsub) {
    pubsub.waitOn($scope, "project", function(data) {
        console.dir(data);
    })
}

function ProcessDetailsController($scope) {

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
