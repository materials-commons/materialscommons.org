Application.Controllers.controller('MeasurementController',
    ["$scope", "$log", "modal", "measurements", MeasurementController]);

function MeasurementController($scope, $log, modal, measurements) {

    $scope.modal = modal;
    //Initializing the sample
    $scope.copySample = angular.copy($scope.modal.sample);

    $scope.showDetails = function (template) {
        $scope.message = "";
        $scope.chosenProperty = template;
        if (!('measures' in $scope.chosenProperty)) {
            $scope.chosenProperty.measures = [];
            $scope.editMeasurement();
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
        $scope.message = $scope.chosenProperty.name + ' is saved onto the left sidebar!';
    };

    $scope.addNewChoice = function () {
        $scope.message = "";
        $scope.editMeasurement();
    };

    $scope.removeChoice = function (index) {
        $scope.message = "";
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
            var property_id = $scope.copySample.properties[i].property_id;
            j = _.indexOf($scope.modal.sample.properties, function (entry) {
                return chosenProperty.name === entry.name;
            });
            if (j === -1) {
                //chosenProperty.property_id = property_id;
                //$scope.modal.sample.properties.push(chosenProperty);
            } else {
                $scope.modal.sample.properties[j].measures = chosenProperty.measures;
            }
        }
        return $scope.modal.sample;
    }

    function init() {
        $scope.templates = measurements.templatesCopy();
    }

    init();

}
