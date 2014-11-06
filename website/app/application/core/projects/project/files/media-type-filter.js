//Filter experiment or computation templates

Application.Filters.filter('byMediaType', function () {
    return function (items, values) {
        var matches = [];
        if (items) {
            items.forEach(function(item) {
                if ('mediatype' in item) {
                    values.forEach(function(val){
                        if (item.mediatype === val){
                            matches.push(item);
                        }
                    });
                }
            });
        }
        return matches;
    };
});
