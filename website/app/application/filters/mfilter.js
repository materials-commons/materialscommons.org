Application.Filters.filter("mfilter", ["$filter", mfilter]);
function mfilter($filter) {
    return function(items, searchStr) {
        if (!searchStr) {
            return items;
        }
        var strs = searchStr.match(/\S+/g);
        var filteredItems = items;
        strs.forEach(function(search) {
            var matches = $filter('filter')(filteredItems, search);
            filteredItems = matches;
        });
        return filteredItems;
    };
}
