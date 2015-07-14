Application.Controllers.controller('TransformationController',
    ["$scope", "$log",  "modal","pubsub",TransformationController]);

function TransformationController($scope, $log, modal, pubsub) {

    $scope.modal = modal;
    setPropertiesToUnknown(); //is a default option

    $scope.ok = function () {
        var transformed_sample = {
            sample_id: $scope.modal.sample.id,
            shares: [],
            uses: [],
            property_set_id: $scope.modal.sample.property_set_id
        };

        $scope.modal.sample.properties.forEach(function(property){
            if (property.action === 'share'){
                transformed_sample.shares.push(property.id);
            }else if(property.action === 'copy'){
                transformed_sample.uses.push(property.id);
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
