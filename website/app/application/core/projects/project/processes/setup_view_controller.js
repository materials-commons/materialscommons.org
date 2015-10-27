(function (module) {
    module.controller('setupViewController', setupViewController);
    setupViewController.$inject = ["$scope", "modal"];

    function setupViewController($scope, modal) {
        var ctrl = this;

        $scope.modal = modal;
         console.dir($scope.modal);

        $scope.ok = function () {
            $scope.modal.instance.close();
        };

        $scope.cancel = function () {
            $scope.modal.instance.dismiss('cancel');
        };

        $scope.modal.instance.result.then(function (selectedItem) {
            $scope.selected = selectedItem;
        });
    }
}(angular.module('materialscommons')));