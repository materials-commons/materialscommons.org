Application.Filters.filter('page', function () {
    return function (input, currentPage, pageSize) {
        var from = currentPage * pageSize, to = from + pageSize;
        return input ? input.slice(from, to) : [];
    };
});