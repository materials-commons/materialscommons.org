Application.Controllers.controller('MeasurementController',
    ["$scope", "$log", "modal", "pubsub", "measurements", MeasurementController]);

function MeasurementController($scope, $log, modal, pubsub, measurements) {

    $scope.modal = modal;
    if (!('measurements' in $scope.modal.sample)) {
        $scope.modal.sample = {
            measurements : []
        };
    }

    $scope.enterValue = false;

    $scope.showDetails = function (template) {
        $scope.enterValue = false;
        var i = _.indexOf($scope.modal.sample.measurements, function (entry) {
            return template.name === entry.name;
        });
        if (i < 0){ // Then this measurement is already there in sample
            template.properties = [];
            $scope.modal.sample.measurements.push(template);
            $scope.currentMeasurement = template;
        }else{
            $scope.currentMeasurement = $scope.modal.sample.measurements[i];
        }
    };

    $scope.ok = function () {
        $scope.modal.instance.close($scope.currentMeasurement);
    };

    $scope.cancel = function () {
        $scope.modal.instance.dismiss('cancel');
    };

    $scope.editMeasurement = function () {
        var property = measurements.newInstance($scope.currentMeasurement);
        $scope.enterValue = true;
        $scope.currentMeasurement.properties.push(property.property);
    };

    $scope.done = function () {
        console.dir($scope.currentMeasurement);
        $scope.enterValue = false;
        $scope.modal.sample.measurements.push($scope.choices);
        $scope.modal.sample.measurements = _.flatten($scope.modal.sample.measurements);
        pubsub.send('updateSampleMeasurement', $scope.modal.sample);
    };

    $scope.addNewChoice = function () {
        $scope.editMeasurement();
    };

    $scope.removeChoice = function (index) {
        $scope.measurement.properties.splice(index, 1);
    };

    $scope.modal.instance.result.then(function (selectedItem) {
        $scope.selected = selectedItem;

    }, function () {
        $log.info('Modal dismissed at: ' + new Date());
    });

    function init() {
        $scope.templates = measurements.templates();
    }

    init();

}
