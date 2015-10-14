(function (module) {
    module.directive("measurementsTab", measurementsTabDirective);

    function measurementsTabDirective() {
        return {
            scope: {
                sample: '=',
                project: '='
            },
            restrict: "E",
            templateUrl: "application/core/projects/project/samples/measurements-tab.html",
            controller: "measurementsTabDirectiveController",
            controllerAs: 'ctrl',
            bindToController: true
        };
    }

    module.controller("measurementsTabDirectiveController", measurementsTabDirectiveController);
    measurementsTabDirectiveController.$inject = ["$modal"];

    function measurementsTabDirectiveController($modal) {
        var ctrl = this;
        ctrl.measurements = measurements;

        ctrl.modal = {
            instance: null,
            property: {}
        };

        function measurements(property) {
            ctrl.modal = {
                instance: null,
                property: property,
                sample_id: ctrl.sample.id
            };

            ctrl.modal.instance = $modal.open({
                size: 'lg',
                templateUrl: 'application/core/projects/project/samples/view-measurements.html',
                controller: 'viewMeasurementController',
                resolve: {
                    modal: function () {
                        return ctrl.modal;
                    },
                    project: function () {
                        return ctrl.project;
                    }
                }
            });
        }


    }
}(angular.module('materialscommons')));
