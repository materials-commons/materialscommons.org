export function pubsubService($rootScope) {
    'ngInject';

    var pubsubService = {};
    pubsubService.message = '';

    pubsubService.send = function(channel, msg) {
        if (arguments.length === 2) {
            this.message = msg;
        } else {
            this.message = '';
        }
        $rootScope.$broadcast(channel);
    };

    pubsubService.waitOn = function(scope, channel, fn) {
        scope.$on(channel, function() {
            fn(pubsubService.message);
        });
    };

    return pubsubService;
}