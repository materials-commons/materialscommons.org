Application.Filters.filter('processFilter', function () {
    return function (items, type1, type2) {
        if (items) {
            arr = [];
            for (var i = 0; i < items.length; i++) {
                if (items[i].type == type1) {
                    arr.push(items[i])
                } else if (items[i].type == type2) {
                    arr.push(items[i])
                }

            }
            return arr
        }
    };
});
