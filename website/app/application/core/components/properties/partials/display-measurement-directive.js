Application.Directives.directive('displayMeasurement', displayMeasurementDirective);
function displayMeasurementDirective() {
    return {
        restrict: "EA",
        controller: 'displayMeasurementDirectiveController',
        scope: {
            measure: '=measure',
            currentProcess: '='
        },
        templateUrl: 'application/core/components/properties/partials/display-measurement.html'
    };
}

Application.Controllers.controller("displayMeasurementDirectiveController",
    ["$scope",  "$modal", displayMeasurementDirectiveController]);
function displayMeasurementDirectiveController($scope, $modal) {

    $scope.showLineChart = function(measurement){

        console.dir(measurement);
        $scope.modal = {
            instance: null,
            measurement: measurement
        };

        $scope.modal.instance = $modal.open({
            size: 'lg',
            templateUrl: 'application/core/projects/project/processes/sidebar/line-graph.html',
            controller: '',
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