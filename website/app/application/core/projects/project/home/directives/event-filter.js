//Filter experiment or computation templates

Application.Filters.filter('event', function () {
    return function (items, date) {
        var matches = [];
        if (items) {
            items.forEach(function(item) {
                console.log(items);

            });
        }
        return matches;
    };
});
