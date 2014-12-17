Application.Services.factory('Review',
    ["$filter", function ($filter) {
        var service = {

            findReview: function(reviewID, which, project) {
                var i = _.indexOf(project[which], function (review) {
                    return review.id === reviewID;
                });
                return project[which][i];
            }

            //closeReview: function () {
            //    var reviewID = $scope.review.id;
            //    mcapi('/reviews/%', reviewID)
            //        .success(function () {
            //            $scope.review = '';
            //            var review = findReview(reviewID, "reviews");
            //            review.status = "closed";
            //            reviewCount();
            //            $state.go('projects.project.reviews.overview');
            //        }).put({'status': 'closed'});
            //},
            //
            //openReview: function () {
            //    var reviewID = $scope.review.id;
            //    mcapi('/reviews/%', $scope.review.id)
            //        .success(function () {
            //            $scope.review = '';
            //            var review = findReview(reviewID, "reviews");
            //            review.status = "open";
            //            reviewCount();
            //            $state.go('projects.project.reviews.overview');
            //        }).put({'status': 'open'});
            //}

        };
        return service;
    }]);
