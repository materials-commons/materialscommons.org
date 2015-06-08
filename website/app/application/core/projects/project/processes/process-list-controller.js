Application.Controllers.controller('projectListProcess',
    ["$scope", "project", "$state","$modal", projectListProcess]);

function projectListProcess($scope, project, $stateParams, $modal) {
    this.all = project.processes;
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
