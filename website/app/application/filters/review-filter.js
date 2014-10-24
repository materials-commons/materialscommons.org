Application.Filters.filter('reviewFilter', function () {
    return function (reviews, status) {
        var matches = [];
        if (!reviews) {
            return matches;
        }

        for (var i = 0; i < reviews.length; i++) {
            if (reviews[i].status == status) {
                matches.push(reviews[i]);
            }
        }
        return matches;
    };
});
