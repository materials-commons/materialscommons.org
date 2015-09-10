(function (module) {
    module.filter('toDateString', function () {
        return function (input) {
            if (input) {
                var t = input.epoch_time;
                s = new Date(t * 1000).toDateString();
                return s;
            }
            return "";
        };
    });
}(angular.module('materialscommons')));
