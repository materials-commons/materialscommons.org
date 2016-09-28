(function (module) {
    module.filter('reverse', function () {
        return function (items) {
            return items.slice().reverse();
        };
    });
}(angular.module('materialscommons')));
