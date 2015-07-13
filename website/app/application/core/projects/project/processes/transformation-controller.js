Application.Controllers.controller('TransformationController',
    ["$scope", "$log",  "modal",TransformationController]);

function TransformationController($scope, $log, modal) {

    $scope.modal = modal;
    console.dir(modal.sample);
    $scope.selected = {
        item: {}
    };

    $scope.ok = function () {
        console.log($scope.selected.item );
        $scope.transformed_sample = {sample_id: $scope.modal.sample.id,
            'property_set_id': $scope.modal.sample.property_set_id,
            action: $scope.selected.item }
        $scope.modal.instance.close($scope.selected.item);
    };

    $scope.cancel = function () {
    };

    $scope.modal.instance.result.then(function (selectedItem) {
        $scope.selected = selectedItem;

    }, function () {
        $log.info('Modal dismissed at: ' + new Date());
    });
}
