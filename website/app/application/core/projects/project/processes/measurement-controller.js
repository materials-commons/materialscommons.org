(function (module) {
    module.controller('MeasurementController', MeasurementController);
    MeasurementController.$inject = ["$scope", "$log", "modal", "measurements"];

    function MeasurementController($scope, $log, modal, measurements) {

        $scope.modal = modal;
        //Initializing the sample
        $scope.copySample = angular.copy($scope.modal.sample);
        $scope.touchedProperties = [];


        $scope.switchProperty = function (template) {
            //Before you switch the property, verify existing property is Valid and Save
            verifyPreviousProperty($scope.chosenProperty);
            var i = _.indexOf($scope.touchedProperties, function (prop) {
                return prop.name === template.name;
            });
            if (i > -1){
                $scope.chosenProperty = $scope.touchedProperties[i];
            }else{
                $scope.chosenProperty = measurements.newInstance(template).property;
            }
        };

        function verifyPreviousProperty(chosenProperty){
            if (chosenProperty) {
                if (('value' in chosenProperty) && chosenProperty.value !== null) {
                    if (isExistingPropertyValid(chosenProperty)) {
                        $scope.touchedProperties.push(chosenProperty);
                        savePropertyToSample(chosenProperty);
                    }
                    else{
                        $scope.message = "Please enter valid numbers.";
                        return;
                    }
                }
            }
        }

        function isExistingPropertyValid(property) {
            var type = property._type;
            var values = [];
            switch (type) {
                case 'number':
                    values = property.value.split("\n");
                    return isNumberValid(values);
                    break;
                case 'fraction':
                    values = property.value.split("\n");
                    return isFractionValid(values);
                    break;
                case 'histogram':
                    var values = [];
                    values = property.value.values.split("\n");
                    return isNumberValid(values);
                    break;
                case 'line':
                    var values = [];
                    values = property.value.values.split("\n");
                    return isNumberValid(values);
                    break;
                case 'selection':
                    return true;
                    break;
                case 'composition':
                    return true;
                    break;
            }
        }

        function savePropertyToSample(property) {
            var type = property._type;
            switch (type) {
                case 'number':
                    values = property.value.split("\n");
                    property.measurements = [];
                    values.forEach(function(v){
                        property.measurements.push({value: v, _type: type, unit: property.unit, attribute: property.attribute});
                    });
                    determineOldOrNew(property);
                    console.dir($scope.modal.sample);
                    break;
                case 'fraction':
                    break;
                case 'histogram':
                    break;
                case 'line':
                    break;
                case 'selection':
                    break;
                case 'composition':
                    break;
            }
        }

        function isNumberValid(values) {
            var isNumeric = true;
            values.forEach(function (v) {
                if (isNaN(v)){
                    isNumeric = false;
                }
            });
            return isNumeric;
        }

        function isFractionValid(values) {
            var isNumeric = true;
            var fraction = [];
            values.forEach(function (v) {
                fraction = v.split("/");
                if (isNaN(fraction[0]) || isNaN(fraction[1])){
                    isNumeric = false;
                }
            });
            return isNumeric;
        }


        $scope.ok = function (isValid) {
            verifyandSaveProperty($scope.chosenProperty);

            $scope.modal.instance.close($scope.chosenProperty);
        };

        $scope.cancel = function () {
            $scope.modal.instance.dismiss('cancel');
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

        function determineOldOrNew(property) {
            var i, j, k;
            i = _.indexOf($scope.copySample.properties, function (entry) {
                return property.name === entry.name;
            });
            if (i < 0) {
               j = _.indexOf($scope.copySample.new_properties, function (prop) {
                    return property.name === prop.name;
                });
                if (i < 0) {
                    $scope.modal.sample.new_properties.push(property);
                }else{
                    $scope.modal.sample.new_properties[j] = property;
                }
            } else {
                k = _.indexOf($scope.copySample.properties, function (prop) {
                    return property.name === prop.name;
                });
                if (k < 0) {
                    $scope.modal.sample.old_properties.push(property);
                }else{
                    $scope.modal.sample.old_properties[k] = property;
                }
            }
        }


        function init() {
            $scope.templates = measurements.templatesCopy();
        }

        init();

    }
}(angular.module('materialscommons')));
