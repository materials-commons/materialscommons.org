Application.Controllers.controller('viewMeasurementController',
    ["$scope", "project", "$state", "$log", "modal", viewMeasurementController]);

function viewMeasurementController($scope, project, $state, $log, modal) {
    $scope.modal = modal;
    this.all = project.processes;
    $scope.selected = {
        item: {}
    };

    $scope.ok = function () {
        $scope.modal.instance.close($scope.selected.item);
        //Template.setActiveTemplate($scope.selected.item);
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
