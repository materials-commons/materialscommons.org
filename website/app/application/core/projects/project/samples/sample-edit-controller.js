Application.Controllers.controller('projectEditSample',
    ["$scope", "$modal", projectEditSample]);

function projectEditSample($scope, $modal) {
    $scope.processes = ["SEM Imaging", "Heat Treatment", "As Received"];
    $scope.attachments = ["A1.jpg", "B1.png"];
    $scope.measurements = function () {
        $scope.modal = {
            instance: null,
            items: []
        };

        $scope.modal.instance = $modal.open({
            size: 'lg',
            templateUrl: 'application/core/projects/project/samples/view-measurements.html',
            controller: 'viewMeasurementController',
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

