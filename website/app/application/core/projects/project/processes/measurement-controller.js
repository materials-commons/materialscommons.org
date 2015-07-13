Application.Controllers.controller('MeasurementController',
    ["$scope", "$log", "modal", "pubsub", "measurements", "mcapi", MeasurementController]);

function MeasurementController($scope, $log, modal, pubsub, measurements, mcapi) {

    $scope.modal = modal;
    //Initializing the sample
    $scope.copySample = angular.copy($scope.modal.sample);
    console.dir($scope.copySample);

    $scope.showDetails = function (template) {
        $scope.chosenProperty = template;
        if (!('measures' in $scope.chosenProperty)) {
            $scope.chosenProperty.measures = [];
            $scope.editMeasurement();
        }
        var old_measures = [];
        old_measures = existingMeasures($scope.chosenProperty, $scope.modal.sample);
        console.log('returning existing measures/measurements');
        console.dir(old_measures);
        if (old_measures.length !== 0) {
            //Old measure are not supposed to be editable
            //$scope.chosenProperty.measures = old_measures;
        }
    };

    $scope.editMeasurement = function () {
        var propertyInstance = measurements.newInstance($scope.chosenProperty);
        $scope.chosenProperty.measures.push(propertyInstance.property);
    };

    $scope.ok = function () {
        $scope.modal.instance.close($scope.chosenProperty);
    };

    $scope.cancel = function () {
        $scope.modal.instance.dismiss('cancel');
    };


    $scope.save = function () {
        $scope.modal.sample = storeProperties($scope.chosenProperty);
        //pubsub.send('updateSampleMeasurement', $scope.modal.sample);
    };

    $scope.addNewChoice = function () {
        $scope.editMeasurement();
    };

    $scope.removeChoice = function (index) {
        $scope.chosenProperty.measures.splice(index, 1);
    };

    $scope.modal.instance.result.then(function (selectedItem) {
        $scope.selected = selectedItem;

    }, function () {
        $log.info('Modal dismissed at: ' + new Date());
    });

    function storeProperties(chosenProperty) {
        var i, j;
        i = _.indexOf($scope.copySample.properties, function (entry) {
            return chosenProperty.name === entry.name;
        });
        console.log('checking if property exists' + i);
        if (i === -1) {
            //check if this property is already there in new properties.
            j = _.indexOf($scope.modal.sample.new_properties, function (entry) {
                return chosenProperty.name === entry.name;
            });
            if (j === -1) {
                $scope.modal.sample.new_properties.push(chosenProperty);
            } else {
                $scope.modal.sample.new_properties[j].measures = chosenProperty.measures;
            }
        } else {
            j = null;
            var property_id = $scope.copySample.properties[i].attribute_id;
            j = _.indexOf($scope.modal.sample.properties, function (entry) {
                return chosenProperty.name === entry.name;
            });
            console.log('checking at what index it  exists' + j);
            if (j === -1) {
                //chosenProperty.property_id = property_id;
                //$scope.modal.sample.properties.push(chosenProperty);
            } else {
                console.log($scope.modal.sample.properties[j]);
                $scope.modal.sample.properties[j].measures = chosenProperty.measures;
            }
        }
        return $scope.modal.sample;
    }

    function existingMeasures(chosenProperty, sample) {
        console.log('hecking for existing measures ' + chosenProperty);
        $scope.measures = [];
        var i = _.indexOf(sample.properties, function (entry) {
            return chosenProperty.name === entry.name;
        });
        if (i === -1) {
            var j = _.indexOf(sample.new_properties, function (item) {
                return chosenProperty.name === item.name;
            });
            if (j === -1) {
                return $scope.measures;
            } else {
                $scope.measures = sample.new_properties[j].measures;
                return $scope.measures;
            }
        } else {
            $scope.measures = sample.properties[i].measurements;
            return $scope.measures;
        }
    }

    function init() {
        $scope.templates = measurements.templates();
        //$scope.copySample.properties = [
        //    {
        //        name: "Height",
        //        property_id: "ABC123",
        //        measurements: [
        //            {value: "50", unit: "m", _type: "number"},
        //            {value: "100", unit: "m", _type: "number"}
        //        ]
        //    }
        //];
    }

    init();

}
