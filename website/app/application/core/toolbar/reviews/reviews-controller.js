Application.Controllers.controller('toolbarReviews',
    ["$scope", "mcapi", "$state", "pubsub",

        function ($scope, mcapi, $state, pubsub) {
            pubsub.waitOn($scope, 'reviews.change', function () {
                $scope.retrieveReviewsToConduct();
            });

            $scope.retrieveReviewsToConduct = function () {
                mcapi('/reviews/to_conduct')
                    .success(function (reviews) {
                        $scope.reviewsToConduct = reviews;
                    }).jsonp();
            };

            $scope.retrieveReviewsRequested = function () {
                mcapi('/reviews/requested')
                    .success(function (reviews) {
                        $scope.reviewsRequested = reviews;
                    }).jsonp();
            };

            $scope.gotoReview = function (review) {
                switch (review.item_type) {
                case "datafile":
                    $state.go('toolbar.dataedit', {id: review.item_id});
                    break;
                case "draft":
                    console.dir(review);
                    $state.go('toolbar.projectspage', {id: review.project_id, draft_id: review.item_id});
                    break;
                default:
                    console.log("Unknown type: " + review.item_type);
                }
            };

            $scope.init = function () {
                $scope.retrieveReviewsRequested();
                $scope.retrieveReviewsToConduct();
            };

            $scope.init();
        }]);
