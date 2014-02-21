Application.Filters.filter('reverse', function () {
    return function () {
        start = +start; //parse to int
        return input.slice(start);
    };
});
