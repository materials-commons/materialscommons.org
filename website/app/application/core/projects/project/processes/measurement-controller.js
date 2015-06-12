Application.Controllers.controller('MeasurementController',
    ["$scope", "project", "$state", "$log", "modal", "Template", "pubsub", MeasurementController]);

function MeasurementController($scope, project, $state, $log, modal, Template, pubsub) {
    $scope.modal = modal;
    this.all = project.processes;
    $scope.selected = {
        item: {}
    };
    //$scope.measurements = ["Composition", "Area Fraction", "Volume Fraction", "Height"];
    $scope.measurements = [
        {name: "composition", type: "string"},
        {name: "Volume Fraction", type: "number"},
        {name: "Height", type: "histogram"}
    ];
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
        $scope.choices = [{id: '1', 'name': measure.name, 'type': measure.type}];
    };

    $scope.done = function () {
        $scope.enterValue = false;
        $scope.modal.sample.measurements.push($scope.choices);
        $scope.modal.sample.measurements = _.flatten($scope.modal.sample.measurements);
        pubsub.send('addMeasurementToSample', $scope.modal.sample);
    };

    $scope.addNewChoice = function () {
        var newItemNo = $scope.choices.length + 1;
        $scope.choices.push({'id': newItemNo, 'name': $scope.measure.name, 'type': $scope.measure.type});
    };

    $scope.removeChoice = function (index) {
        //var lastItem = $scope.choices.length - 1;
        $scope.choices.splice(index, 1);
    };

    $scope.modal.instance.result.then(function (selectedItem) {
        $scope.selected = selectedItem;

    }, function () {
        $log.info('Modal dismissed at: ' + new Date());
    });

}
