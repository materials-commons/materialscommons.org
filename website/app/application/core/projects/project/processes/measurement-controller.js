Application.Controllers.controller('MeasurementController',
    ["$scope", "$log", "modal", "pubsub", "measurements", "$filter", MeasurementController]);

function MeasurementController($scope, $log, modal, pubsub, measurements, $filter) {

    $scope.modal = modal;
    //Initializing the sample
    $scope.copySample = angular.copy($scope.modal.sample);
    $scope.enterValue = false;

    $scope.showDetails = function (template) {
        $scope.enterValue = false;
        $scope.chosenProperty = template;
        var existing_measures = existingMeasures($scope.chosenProperty);
        if (existing_measures.length === 0) {
            $scope.chosenProperty.measures = [];
        } else {
            $scope.chosenProperty.measures = [];
            $scope.chosenProperty.measures = existing_measures;
        }
    };

    $scope.ok = function () {
        $scope.modal.instance.close($scope.chosenProperty);
    };

    $scope.cancel = function () {
        $scope.modal.instance.dismiss('cancel');
    };

    $scope.editMeasurement = function () {
        $scope.propertyInstance = measurements.newInstance($scope.chosenProperty);
        $scope.enterValue = true;
        $scope.chosenProperty.measures.push($scope.propertyInstance.property);
    };

    $scope.save = function () {
        $scope.enterValue = false;
        storeProperties($scope.chosenProperty);
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

    function storeProperties(chosenProperty) {
        var i = _.indexOf($scope.copySample.properties, function (entry) {
            return chosenProperty.name === entry.name;
        });
        if (i === -1) {
            chosenProperty.measures.forEach(function (item) {
                $scope.modal.sample.new_properties.push(item);
            });
        } else {
            var property_id = $scope.copySample.properties[i].property_id;
            chosenProperty.measures.forEach(function (item) {
                item.property_id =  property_id;
                $scope.modal.sample.properties.push(item);
            });
        }

    }

    function existingMeasures(chosenProperty) {
        var existing_measures = [];
        var i = _.indexOf($scope.modal.sample.properties, function (entry) {
            return chosenProperty.name === entry.name;
        });
        if (i === -1) {
            var j = _.indexOf($scope.modal.sample.new_properties, function (entry) {
                return chosenProperty.name === entry.name;
            });
            if (j === -1) {
                return existing_measures;
            } else {
                existing_measures = $filter('byKey')($scope.modal.sample.new_properties, 'name', chosenProperty.name);
                return existing_measures;
            }
        } else {
            existing_measures = $filter('byKey')($scope.modal.sample.properties, 'name', chosenProperty.name);
            return existing_measures;
        }

    }

    function init() {
        $scope.templates = measurements.templates();
        $scope.copySample.properties = [
            {
                name: "Height",
                property_id: "ABC123",
                measurements: [
                    {value: "50", unit: "m", _type: "number"},
                    {value: "100", unit: "m", _type: "number"}
                ]
            }
        ];
    }

    init();

}
