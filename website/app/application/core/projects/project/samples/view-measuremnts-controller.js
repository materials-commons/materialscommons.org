Application.Controllers.controller('viewMeasurementController',
    ["$scope", "project", "$state", "$log", "modal", "Template", viewMeasurementController]);

function viewMeasurementController($scope, project, $state, $log, modal, Template) {
    $scope.modal = modal;
    $scope.modal.items = ["Mg+AL","Nd+Br","Al+W+Tn","Unknown"];
    this.all = project.processes;
    $scope.selected = {
        item: {}
    };

    $scope.ok = function () {
        $scope.modal.instance.close($scope.selected.item);
        Template.setActiveTemplate($scope.selected.item);
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
