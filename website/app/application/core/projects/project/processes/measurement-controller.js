Application.Controllers.controller('MeasurementController',
    ["$scope", "project", "$state","$log", "modal","Template",  MeasurementController]);

function MeasurementController($scope, project, $state,  $log, modal, Template) {
    $scope.modal = modal;
    this.all = project.processes;
    $scope.selected = {
        item: {}
    };
    $scope.measurements = ["Composition", "Area Fraction", "Volume Fraction", "Height"];
    $scope.enterValue = false;

    $scope.showDetails = function(measurement){
        $scope.enterValue = false;
        $scope.measurement = measurement;
        $scope.selected.item = measurement;
    };

    $scope.ok = function () {
        $scope.modal.instance.close($scope.selected.item);
        Template.setActiveTemplate($scope.selected.item);
        $state.go('projects.project.processes.create');
    };

    $scope.cancel = function () {
        $scope.modal.instance.dismiss('cancel');
    };

    $scope.modal.instance.result.then(function (selectedItem) {
        $scope.selected = selectedItem;

    }, function () {
        $log.info('Modal dismissed at: ' + new Date());
    });

    $scope.enterValue = function(measure){
        $scope.enterValue = true;
        $scope.measure = measure;
    };
}
