Application.Directives.directive('displayMeasurement', displayMeasurementDirective);
function displayMeasurementDirective() {
    return {
        restrict: "EA",
        controller: 'displayMeasurementDirectiveController',
        scope: {
            measure: '=measure',
            currentProcess: '=',
            project: '=project'
        },
        templateUrl: 'application/core/components/properties/partials/display-measurement.html'
    };
}

Application.Controllers.controller("displayMeasurementDirectiveController",
    ["$scope",  "$modal", "modalInstance", displayMeasurementDirectiveController]);
function displayMeasurementDirectiveController($scope, $modal, modalInstance) {

    $scope.openProcess = function(processID) {
        var i = _.indexOf($scope.project.processes, function(proc) {
            return proc.id == processID;
        });
        if (i !== -1) {
            modalInstance.openModal($scope.project.processes[i], 'process', $scope.project);
        }
    };

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