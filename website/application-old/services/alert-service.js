(function (module) {
    module.factory('alertService',
        ["$rootScope", function ($rootScope) {
            var sharedService = {};
            sharedService.message = '';

            sharedService.sendMessage = function (msg) {
                this.message = msg;
                this.broadcastItem();
            };

            sharedService.broadcastItem = function () {
                $rootScope.$broadcast('handleBroadcast');
            };

            return sharedService;
        }]);
}(angular.module('materialscommons')));