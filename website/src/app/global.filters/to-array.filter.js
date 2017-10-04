function toArrayFilter() {
    return function (item) {
        return _.size(item);
    }
}

angular.module('materialscommons').filter('toArray', toArrayFilter);