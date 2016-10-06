(function (module) {
    module.filter('event', function () {
        return function (items, currentdate, nextdate) {
            var matches = [];
            if (currentdate && nextdate) {
                items.forEach(function (item) {
                    var mtime = item.mtime.epoch_time * 1000;
                    if (mtime < nextdate && mtime >= currentdate) {
                        matches.push(item);
                    }
                });
                return matches;
            } else {
                return items;
            }
        };
    });
}(angular.module('materialscommons')));
