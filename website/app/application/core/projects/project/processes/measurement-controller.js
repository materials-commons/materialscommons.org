Application.Controllers.controller('MeasurementController',
    ["$scope", "project", "$state", "$log", "modal", "Template", "pubsub",MeasurementController]);

function MeasurementController($scope, project, $state, $log, modal, Template, pubsub) {
    $scope.modal = modal;
    this.all = project.processes;
    $scope.selected = {
        item: {}
    };
    $scope.measurements = ["Composition", "Area Fraction", "Volume Fraction", "Height"];
    $scope.enterValue = false;
    $scope.choices = [{id: '1'}];

    $scope.showDetails = function (measurement) {
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

    $scope.editMeasurement = function (measure) {
        $scope.enterValue = true;
        $scope.measure = measure;
        $scope.choices = [{id: '1', 'name': measure}];
    };

    $scope.done = function () {
        $scope.enterValue = false;
        $scope.modal.sample.measurements = [];
        $scope.modal.sample.measurements = $scope.choices;
        pubsub.send('addMeasurementToSample', $scope.modal.sample);
    };

    $scope.addNewChoice = function() {
        var newItemNo = $scope.choices.length+1;
        $scope.choices.push({'id': newItemNo, 'name': $scope.measure});
    };

    $scope.removeChoice = function() {
        var lastItem = $scope.choices.length-1;
        $scope.choices.splice(lastItem);
    };

    $scope.modal.instance.result.then(function (selectedItem) {
        $scope.selected = selectedItem;

    }, function () {
        $log.info('Modal dismissed at: ' + new Date());
    });

}
