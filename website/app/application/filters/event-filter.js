Application.Filters.filter('event', function () {
    return function (items, date) {
        var matches = [];
        if (date) {
            items.forEach(function (item) {
                if (item.converted_mtime === date) {
                    matches.push(item);
                }
            });
            return matches;
        } else {
            return items;
        }
    };
});
