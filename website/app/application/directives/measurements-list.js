(function (module) {
    module.directive('measurementsList', measurementsListDirective);
    function measurementsListDirective() {
        return {
            restrict: 'E',
            scope: {
                sample: '='
            },
            controller: 'measurementsListDirectiveController',
            controllerAs: 'ctrl',
            bindToController: true,
            templateUrl: 'application/directives/partials/measurements-list.html'
        };
    }


    module.controller("measurementsListDirectiveController", measurementsListDirectiveController);
    measurementsListDirectiveController.$inject = ["$modal", "current"];

    function measurementsListDirectiveController($modal, current) {
        var ctrl = this;
        ctrl.measurements = measurements;

        ctrl.project = current.project();

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

