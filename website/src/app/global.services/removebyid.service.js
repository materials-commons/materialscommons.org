function removeByIdService() {
    return function removeById(from, what) {
        var i = _.indexOf(from, function(item) {
            return item.id === what.id;
        });

        if (i !== -1) {
            from.splice(i, 1);
        }

        return i;
    };
}

angular.module('materialscommons').factory('removeByIdService', removeByIdService);
