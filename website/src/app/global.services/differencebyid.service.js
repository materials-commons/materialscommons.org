function differenceByIdService() {
    return function differenceById(from, others) {
        var idsFrom = from.map(function(entry) {
            return entry.id;
        });
        var idsOthers = others.map(function(entry) {
            return entry.id;
        });

        var diff = _.difference(idsFrom, idsOthers);
        return from.filter(function(entry) {
            return _.indexOf(diff, function(e) {
                    return e == entry.id;
                }) !== -1;
        });
    };
}

angular.module('materialscommons').factory('differenceById', differenceByIdService);