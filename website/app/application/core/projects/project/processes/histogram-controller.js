Application.Controllers.controller('histogramController',
    ["$scope", "modal", "$log", "project", histogramController]);

function histogramController($scope, modal, $log, project) {
    $scope.modal = modal;
    $scope.project = project;
    processColumns();
    $scope.selected = {
        item: {}
    };
    $scope.ok = function () {
        $scope.modal.instance.close($scope.selected.item);
    };

    $scope.cancel = function () {
        $scope.modal.instance.dismiss('cancel');
    };

    $scope.modal.instance.result.then(function (selectedItem) {
        $scope.selected = selectedItem;

    }, function () {
        $log.info('Modal dismissed at: ' + new Date());
    });

    function processColumns(){
        $scope.categories = $scope.modal.property.value.categories.split("\n");
        $scope.values = $scope.modal.property.value.values.split("\n");
    }
}

