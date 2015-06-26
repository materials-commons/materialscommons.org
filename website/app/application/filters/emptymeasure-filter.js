
Application.Filters.filter('emptyMeasure', function () {
    return function (measures) {
        var matches = [];
        if (measures) {
            angular.forEach(measures, function (item) {
                if (item.value !== null ) {
                    matches.push(item);
                }
            });
        }
        return matches;
    };
});
