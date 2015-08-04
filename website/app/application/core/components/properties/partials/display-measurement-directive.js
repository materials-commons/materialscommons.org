Application.Directives.directive('displayMeasurement', displayMeasurementDirective);
function displayMeasurementDirective() {
    return {
        restrict: "EA",
        controller: 'displayMeasurementDirectiveController',
        scope: {
            measure: '=measure',
            currentProcess: '=',
            project: '=project',
            editMeasure: '='
        },
        templateUrl: 'application/core/components/properties/partials/display-measurement.html'
    };
}

Application.Controllers.controller("displayMeasurementDirectiveController",
    ["$scope",  "$modal",  displayMeasurementDirectiveController]);
function displayMeasurementDirectiveController($scope, $modal) {

    $scope.showHistogram = function(property){
        $scope.modal = {
            instance: null,
            property: property
        };

        $scope.modal.instance = $modal.open({
            size: 'lg',
            templateUrl: 'application/core/projects/project/processes/histogram.html',
            controller: 'histogramController',
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

    $scope.showLineGraph = function(property){
        $scope.modal = {
            instance: null,
            property: property
        };

        $scope.modal.instance = $modal.open({
            size: 'lg',
            templateUrl: 'application/core/projects/project/processes/line.html',
            controller: 'lineGraphController',
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