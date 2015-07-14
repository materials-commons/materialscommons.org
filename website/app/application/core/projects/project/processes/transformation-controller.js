Application.Controllers.controller('TransformationController',
    ["$scope", "$log",  "modal",TransformationController]);

function TransformationController($scope, $log, modal) {

    $scope.modal = modal;
    setPropertiesToUnknown(); //is a default option

    $scope.ok = function () {
        $scope.modal.sample.transformed_properties = $scope.modal.sample.properties;
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
