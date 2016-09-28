(function (module) {
    module.controller('TransformationController', TransformationController);
    TransformationController.$inject = ["$scope", "$log", "modal", "pubsub"];

    function TransformationController($scope, $log, modal, pubsub) {
        $scope.modal = modal;
        setPropertiesToUnknown(); //is a default option
        $scope.actions = ["Is Transformed", "Not Transformed", "End Attribute"];
        $scope.ok = function () {
            var transformed_sample = {
                sample_id: $scope.modal.sample.id,
                name: $scope.modal.sample.name,
                shares: [],
                uses: [],
                deletes: [],
                unknowns: [],
                property_set_id: $scope.modal.sample.property_set_id
            };
            $scope.modal.sample.properties.forEach(function (property) {
                if (property.action === 'Not Transformed') {
                    transformed_sample.shares.push({id: property.id, name: property.name});
                } else if (property.action === 'copy') {
                    transformed_sample.uses.push({id: property.id, name: property.name});
                } else if (property.action === 'Is Transformed') {
                    transformed_sample.unknowns.push({id: property.id, name: property.name});
                } else if (property.action === 'End Attribute') {
                    transformed_sample.deletes.push({id: property.id, name: property.name});
                }
            });
            pubsub.send('updateTransformedSample', transformed_sample);
            $scope.modal.instance.close($scope.modal);
        };

        $scope.cancel = function () {
        };

        function setPropertiesToUnknown() {
            $scope.modal.sample.properties.forEach(function (property) {
                if (!(property.action)) {
                    property.action = 'End Attribute';
                }
            });
        }

        $scope.modal.instance.result.then(function (selectedItem) {
            $scope.selected = selectedItem;

        }, function () {
            $log.info('Modal dismissed at: ' + new Date());
        });
    }
}(angular.module('materialscommons')));
