(function (module) {
    module.controller('viewMeasurementController', viewMeasurementController);
    viewMeasurementController.$inject = ["$scope", "project", "$state", "$log", "modal", "mcapi", "pubsub"];

    function viewMeasurementController($scope, project, $state, $log, modal, mcapi, pubsub) {
        $scope.modal = modal;
        this.all = project.processes;
        $scope.selected = {
            item: {}
        };
        processColumns();

        function updateBestMeasure() {
            mcapi('/best_measure')
                .success(function () {
                    pubsub.send('updateBestMeasurement');
                }).post({
                    property_id: $scope.modal.property.property_id,
                    measurement_id: $scope.selected.item.measurement_id
                })
        }

        $scope.ok = function () {
            updateBestMeasure();
            $scope.modal.instance.close($scope.selected.item);
            $state.go('projects.project.samples.all.edit');
        };

        $scope.cancel = function () {
            $scope.modal.instance.dismiss('cancel');
        };

        $scope.modal.instance.result.then(function (selectedItem) {
            $scope.selected = selectedItem;
        }, function () {
            $log.info('Modal dismissed at: ' + new Date());
        });

        function processColumns() {
            $scope.modal.property.measurements.forEach(function (measure) {
                if (measure._type === 'line' || measure._type === 'histogram') {
                    measure.categories = measure.value.categories.split("\n");
                    measure.values = measure.value.values.split("\n");
                }
                //Setting radio button to checked if best measure is already present
                if ($scope.modal.property.best_measure.length > 0) {
                    if (measure.measurement_id === $scope.modal.property.best_measure[0].id) {
                        $scope.selected.item = measure;
                    }
                }
            });
        }
    }
}(angular.module('materialscommons')));
