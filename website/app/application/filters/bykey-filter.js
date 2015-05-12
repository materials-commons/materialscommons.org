//Filter experiment or computation templates

Application.Filters.filter('byKey', function () {
    return function (items, key, value) {
        var matches = [];
        if (items) {
            if (key === 'assigned_to') {
                items.forEach(function (item) {
                    var i = _.indexOf(item[key], function (entry) {
                        return item === entry;
                    });
                    if (i > -1) {
                        matches.push(item);
                    }
                });
            } else {
                items.forEach(function (item) {
                    if (item[key] === value) {
                        matches.push(item);
                    }
                });
            }
        }
        return matches;
    };
});


Application.Filters.filter('removeKey', function () {
    return function (properties, keyToRemove) {
        var matches = {};
        if (properties) {
            angular.forEach(properties, function (value, key) {
                if (key !== keyToRemove) {
                    matches[key] = value;
                }
            });
        }
        return matches;
    };
});
