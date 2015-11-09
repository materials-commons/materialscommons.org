(function (module) {
    module.directive('displayMeasurement', displayMeasurementDirective);
    function displayMeasurementDirective() {
        return {
            restrict: "EA",
            controller: 'displayMeasurementDirectiveController',
            scope: {
                measure: '=measure',
                currentProcess: '=',
                project: '=project',
                editMeasure: '=',
                displayInline: '='
            },
            templateUrl: 'application/core/components/properties/partials/display-measurement.html'
        };
    }

    module.controller("displayMeasurementDirectiveController", displayMeasurementDirectiveController);
    displayMeasurementDirectiveController.$inject = ["$scope", "$modal", "mcmodal"];
    function displayMeasurementDirectiveController($scope, $modal, mcmodal) {
        $scope.openProcess = function (processID) {
            var i = _.indexOf($scope.project.processes, function (proc) {
                return proc.id == processID;
            });
            if (i !== -1) {
                mcmodal.openModal($scope.project.processes[i], 'process', $scope.project);
            }
        };

        $scope.showHistogram = function (property) {
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

        $scope.showLineGraph = function (property) {
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

        $scope.editLineGraph = function (property) {
            $scope.modal = {
                instance: null,
                property: property
            };

            $scope.modal.instance = $modal.open({
                size: 'lg',
                templateUrl: 'application/core/projects/project/processes/edit-line.html',
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

        $scope.editHistogram = function (property) {
            $scope.modal = {
                instance: null,
                property: property
            };

            $scope.modal.instance = $modal.open({
                size: 'lg',
                templateUrl: 'application/core/projects/project/processes/edit-histogram.html',
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
        }

    }
}(angular.module('materialscommons')));
