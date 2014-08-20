Application.Filters.filter('reviewFilter', function () {
    return function (reviews, status) {
        if (reviews) {
            var arr = [];
            for (var i = 0; i < reviews.length; i++) {
                if (reviews[i].status == status) {
                    arr.push(reviews[i])
                }
            }
            return arr
        }
    };
});
