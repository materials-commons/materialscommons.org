function toSizeFilter() {
    return function (item) {
        return _.size(item);
    }
}

angular.module('materialscommons').filter('toSize', toSizeFilter);