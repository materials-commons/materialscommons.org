Application.Controllers.controller('ProcessListController',
    ["$scope", "project", "$state","$modal", ProcessListController]);

function ProcessListController($scope, project, $state, $modal) {
    this.all = project.processes;
    $state.go('projects.project.processes.list');

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
