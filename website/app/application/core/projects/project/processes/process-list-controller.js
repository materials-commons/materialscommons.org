Application.Controllers.controller('projectListProcess',
    ["$scope", "project", "$state", "$modal", projectListProcess]);

function projectListProcess($scope, project, $state, $modal) {
    $scope.project = project;
    $scope.current = project.processes[0];
    //$state.go('projects.project.processes.list.edit', {process_id : $scope.current.id});

    $scope.viewProcess = function (process) {
        $scope.current = process;
        $state.go('projects.project.processes.list.edit', {process_id : $scope.current.id});
    };

    $scope.chooseTemplate = function () {
        $scope.modal = {
            instance: null,
            items: []
        };

        $scope.modal.instance = $modal.open({
            size: 'lg',
            templateUrl: 'application/core/projects/project/processes/template.html',
            controller: 'TemplateInstanceController',
            resolve: {
                modal: function () {
                    return $scope.modal;
                },
                project: function () {
                    return $scope.project;
                }
            }
        });
    };

}
