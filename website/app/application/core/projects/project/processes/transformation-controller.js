Application.Controllers.controller('TransformationController',
    ["$scope", "$log",  "modal","pubsub",TransformationController]);

function TransformationController($scope, $log, modal, pubsub) {

    $scope.modal = modal;
    setPropertiesToUnknown(); //is a default option

    $scope.ok = function () {
        var transformed_sample = {
            sample_id: $scope.modal.sample.id,
            name: $scope.modal.sample.name,
            shares: [],
            uses: [],
            property_set_id: $scope.modal.sample.property_set_id
        };

        $scope.modal.sample.properties.forEach(function(property){
            if (property.action === 'is_not_transformed'){
                transformed_sample.shares.push({id: property.id, name: property.name});
            }else if(property.action === 'is_transformed'){
                transformed_sample.uses.push({id: property.id, name: property.name});
            }
        });
        pubsub.send('updateTransformedSample', transformed_sample);
        $scope.modal.instance.close($scope.modal);
    };

    $scope.cancel = function () {
    };

    function setPropertiesToUnknown(){
        $scope.modal.sample.properties.forEach(function(property){
             property.action = 'unknown';
        });
    }

    $scope.modal.instance.result.then(function (selectedItem) {
        $scope.selected = selectedItem;

    }, function () {
        $log.info('Modal dismissed at: ' + new Date());
    });
}
