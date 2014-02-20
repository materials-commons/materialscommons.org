Application.Services.factory('pubsub',
    ["$rootScope", function ($rootScope) {
        var pubsubService = {};
        pubsubService.message = '';

        pubsubService.send = function (channel, msg) {
            this.message = msg;
            $rootScope.$broadcast(channel);
        }

        pubsubService.waitOn = function (scope, channel, fn) {
            scope.$on(channel, function () {
                fn(pubsubService.message);
            });
        }

        return pubsubService;
    }]);