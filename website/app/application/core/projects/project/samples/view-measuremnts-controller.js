Application.Controllers.controller('viewMeasurementController',
    ["$scope", "project", "$state", "$log", "modal", "mcapi", viewMeasurementController]);

function viewMeasurementController($scope, project, $state, $log, modal, mcapi) {
    $scope.modal = modal;
    this.all = project.processes;
    $scope.selected = {
        item: {}
    };
    console.dir($scope.modal);
    function updateBestMeasure(){
        mcapi('/best_measure')
            .success(function (properties) {
            }).post({attribute_id: $scope.modal.property.attribute_id, measurement_id: $scope.selected.item.measurement_id})
    }

    $scope.ok = function () {
        updateBestMeasure();
        $scope.modal.instance.close($scope.selected.item);
        $state.go('projects.project.samples.edit');
    };

    $scope.cancel = function () {
        $scope.modal.instance.dismiss('cancel');
    };

    $scope.modal.instance.result.then(function (selectedItem) {
        $scope.selected = selectedItem;

    }, function () {
        $log.info('Modal dismissed at: ' + new Date());
    });
}
