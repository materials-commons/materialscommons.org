(function (module) {
    module.controller('_indexAlerts',
        ["$scope", "alertService", function ($scope, alertService) {
            $scope.message = '';
            $scope.$on('handleBroadcast', function () {
                $scope.message = {
                    "type": "info",
                    "content": alertService.message
                };
            });
        }]);
}(angular.module('materialscommons')));
