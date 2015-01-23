//filter projects who have owner="delete@materialscommons.org"

Application.Filters.filter('toDeleteProjects', function () {
    return function (items) {
        var matches = [];
        if (items) {
            items.forEach(function (item) {
                if (item.owner !== 'delete@materialscommons.org') {
                    matches.push(item);
                }
            });
        }
        return matches;
    };
});