function toListFilter() {
    return function (what) {
        if (_.isArray(what)) {
            return what;
        } else {
            return _.values(what);
        }
    }
}

angular.module('materialscommons').filter('toList', toListFilter);