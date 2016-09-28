(function (module) {
    module.controller('MeasurementController', MeasurementController);
    MeasurementController.$inject = ["$scope", "$log", "modal", "measurements"];

    function MeasurementController($scope, $log, modal, measurements) {

        $scope.modal = modal;
        //Initializing the sample
        measurements.copySample($scope.modal.sample);

        $scope.switchProperty = function (template) {
            //Before you switch the property, verify existing property is Valid and Save
            if ($scope.chosenProperty) {
                var verified = measurements.verifyAndSave($scope.chosenProperty);
                if (verified) {
                    newProperty(template);
                } else {
                    $scope.message = "Please enter valid numbers.";
                }
            } else {
                newProperty(template);
            }
        };

        function newProperty(template) {
            $scope.touchedProperties = measurements.getTouchedProperties($scope.modal.sample.name);
            var i = _.indexOf($scope.touchedProperties, function (prop) {
                return prop.name === template.name;
            });
            if (i > -1) {
                $scope.chosenProperty = $scope.touchedProperties[i];
            } else {
                $scope.chosenProperty = measurements.newInstance(template).property;
            }
        }

        $scope.modal.instance.result.then(function (selectedItem) {
            $scope.selected = selectedItem;

        }, function () {
            $log.info('Modal dismissed at: ' + new Date());
        });

        $scope.ok = function () {
            measurements.verifyAndSave($scope.chosenProperty);
            $scope.modal.instance.close($scope.chosenProperty);
        };

        $scope.cancel = function () {
            $scope.modal.instance.dismiss('cancel');
        };

        function init() {
            $scope.templates = measurements.templatesCopy();
        }

        init();

    }
}(angular.module('materialscommons')));
