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
            if ($scope.chosenProperty) {
                var verified = verifyAndSave($scope.chosenProperty);
                if (verified){
                    newProperty(template);
                }else{
                    $scope.message = "Please enter valid numbers.";
                }
            } else {
                newProperty(template);
            }
        };

        function newProperty(template){
            var i = _.indexOf($scope.touchedProperties, function (prop) {
                return prop.name === template.name;
            });
            if (i > -1) {
                $scope.chosenProperty = $scope.touchedProperties[i];
            } else {
                $scope.chosenProperty = measurements.newInstance(template).property;
            }
        }

        function verifyAndSave(chosenProperty) {
            if (('value' in chosenProperty) && chosenProperty.value !== null) {
                if (isExistingPropertyValid(chosenProperty)) {
                    $scope.touchedProperties.push(chosenProperty);
                    processMeasurments(chosenProperty);
                    return true;
                }
                else { return false; }
            } else{ return true; }
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
                    var values = [];
                    values = property.value.values.split("\n");
                    return isNumberValid(values);
                    break;
            }
        }

        function processMeasurments(property) {
            var type = property._type;
            switch (type) {
                case 'number':
                    values = property.value.split("\n");
                    property.measurements = [];
                    values.forEach(function (v) {
                        property.measurements.push({
                            value: v,
                            _type: type,
                            unit: property.unit,
                            attribute: property.attribute
                        });
                    });
                    saveToSample(property);
                    break;
                case 'fraction':
                    values = property.value.split("\n");
                    property.measurements = [];
                    values.forEach(function (v) {
                        property.measurements.push({
                            value: v,
                            _type: type,
                            unit: property.unit,
                            attribute: property.attribute
                        });
                    });
                    saveToSample(property);
                    break;
                case 'histogram':
                    saveToSample(property);
                    break;
                case 'line':
                    saveToSample(property);
                    break;
                case 'selection':
                    saveToSample(property);
                    break;
                case 'composition':
                    var elements = property.value.elements.split("\n");
                    values = property.value.values.split("\n");
                    property.measurements = [];
                    for(var i = 0; i < elements.length; i ++){
                        property.measurements.push({
                            value: values[i],
                            element: elements[i],
                            _type: property._type,
                            unit: property.unit,
                            attribute: property.attribute
                        });
                    }
                    saveToSample(property);
                    break;
            }
        }

        function isNumberValid(values) {
            var isNumeric = true;
            values.forEach(function (v) {
                if (isNaN(v)) {
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
                if (isNaN(fraction[0]) || isNaN(fraction[1])) {
                    isNumeric = false;
                }
            });
            return isNumeric;
        }

        $scope.modal.instance.result.then(function (selectedItem) {
            $scope.selected = selectedItem;

        }, function () {
            $log.info('Modal dismissed at: ' + new Date());
        });

        function saveToSample(property) {
            var i, j, k;
            i = _.indexOf($scope.copySample.properties, function (entry) {
                return property.name === entry.name;
            });
            if (i < 0) {
                j = _.indexOf($scope.modal.sample.new_properties, function (prop) {
                    return property.name === prop.name;
                });
                if (j < 0) {
                    $scope.modal.sample.new_properties.push(property);
                } else {
                    $scope.modal.sample.new_properties[j] = property;
                }
            } else {
                var old_prop = $scope.copySample.properties[i];
                property.property_set_id = old_prop.property_set_id;
                property.property_id = old_prop.property_id;
                k = _.indexOf($scope.modal.sample.old_properties, function (entry) {
                    return property.name === entry.name;
                });
                if (k > 0){
                    $scope.modal.sample.old_properties[k] = property;

                }   else{
                    $scope.modal.sample.old_properties.push(property);
                }
            }
        }

        $scope.ok = function (isValid) {
            verifyAndSave($scope.chosenProperty);

            $scope.modal.instance.close($scope.chosenProperty);
        };

        $scope.cancel = function () {
            $scope.modal.instance.dismiss('cancel');
        };

        //$scope.addNewChoice = function () {
        //    $scope.message = "";
        //    $scope.editMeasurement();
        //};
        //
        //$scope.removeChoice = function (index) {
        //    $scope.message = "";
        //    $scope.chosenProperty.measures.splice(index, 1);
        //};

        function init() {
            $scope.templates = measurements.templatesCopy();
        }

        init();

    }
}(angular.module('materialscommons')));
