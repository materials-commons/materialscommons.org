(function (module) {
    module.filter('byKey', function () {
        return function (items, key, value) {
            var matches = [];
            if (items) {
                if (key === 'assigned_to') { //assigned_to field is an array.
                    items.forEach(function (item) {
                        var i = _.indexOf(item[key], function (entry) {
                            return value === entry;
                        });
                        if (i > -1) {
                            if (item.status === 'open') {
                                matches.push(item);
                            }
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

    module.filter('removeKey', function () {
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
}(angular.module('materialscommons')));
