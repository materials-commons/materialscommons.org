(function (module) {
    module.factory('watcher',
        function () {
            var watcherService = {};

            watcherService.watch = function (scope, variable, fn) {
                scope.$watch(variable, function (newval, oldval) {
                    if (!newval && !oldval) {
                        return;
                    }
                    else if (newval === "" && oldval) {
                        fn(oldval);
                    } else {
                        fn(newval);
                    }
                });
            };

            return watcherService;
        });
}(angular.module('materialscommons')));
