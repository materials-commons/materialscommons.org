Application.Filters.filter('available', function () {

    return function (items) {
        var filtered_items = [], i;
        for (i = 0; i < items.length; i++) {
            if (items[i].available === true) {
                filtered_items.push(items[i]);
            }
        }
        return filtered_items;
    };
});