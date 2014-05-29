Application.Controllers.controller('toolbarReviews',
    ["$scope", "mcapi", "$state", "pubsub", "Nav",

        function ($scope, mcapi, $state, pubsub, Nav) {
            pubsub.waitOn($scope, 'reviews.change', function () {
                $scope.retrieveReviewsToConduct();
            });

            $scope.retrieveReviewsToConduct = function () {
                mcapi('/reviews/to_conduct')
                    .success(function (reviews) {
                        $scope.reviewsToConduct = reviews;
                    }).jsonp();
            };

            $scope.removeReview = function (index) {
                mcapi('/reviews/%', $scope.reviewsRequested[index].id)
                    .success(function () {
                        $scope.reviewsRequested.splice(index, 1);
                        pubsub.send('reviews.change', 'review.change');
                    }).delete();
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
                    $state.go('toolbar.projectspage', {id: review.project_id, draft_id: review.item_id});
                    break;
                default:
                    console.log("Unknown type: " + review.item_type);
                }
            };

            $scope.init = function () {
                Nav.setActiveNav('Reviews');
                $scope.retrieveReviewsRequested();
                $scope.retrieveReviewsToConduct();
            };

            $scope.init();
        }]);
