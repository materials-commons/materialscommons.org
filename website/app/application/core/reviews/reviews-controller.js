Application.Controllers.controller('reviews',
    ["$scope", "mcapi", "$state", "pubsub", "$filter",

        function ($scope, mcapi, $state, pubsub, $filter) {
            pubsub.waitOn($scope, 'reviews.change', function () {
                $scope.retrieveReviewsToConduct();
            });

            $scope.retrieveReviewsToConduct = function () {
                mcapi('/reviews/to_conduct')
                    .success(function (reviews) {
                        $scope.reviewsToConduct = reviews;
                        $scope.conduct_open_reviews = $filter('reviewFilter')(reviews, 'open');
                        $scope.conduct_closed_reviews = $filter('reviewFilter')(reviews, 'close');
                        $scope.reviewsToConduct = $scope.conduct_open_reviews;
                        $scope.status = 'open';
                    }).jsonp();
            };
            $scope.retrieveReviewsRequested = function () {
                mcapi('/reviews/requested')
                    .success(function (reviews) {
                        $scope.requested_open_reviews = $filter('reviewFilter')(reviews, 'open');
                        $scope.requested_closed_reviews = $filter('reviewFilter')(reviews, 'close');
                        $scope.reviewsRequested = $scope.requested_open_reviews;
                        $scope.status = 'open';
                    }).jsonp();
            };


            $scope.removeReview = function (index) {
                mcapi('/reviews/%', $scope.reviewsRequested[index].id)
                    .success(function () {
                        $scope.reviewsRequested.splice(index, 1);
                        pubsub.send('reviews.change', 'review.change');
                    }).delete();
            };

            $scope.viewReview = function (review) {
                if(review.item_type == 'datadir'){
                    $state.go('projects.overview.reviews', {'id': review.item_id});
                }
                else if(review.item_type == 'datafile'){
                    $state.go('projects.dataedit.editreviews', {'draft_id': '', 'data_id': review.item_id, 'file_path': 'global',
                        'review_id': review.id, 'id': '5fcfc6c4-0745-4fa0-9ed7-2b0ac92796c6'});
                }
            };

            $scope.showReviews = function (status) {
                $scope.status = status;
                if (status == 'open') {
                    $scope.list_reviews = $scope.open_reviews;
                }
                else if (status == 'close') {
                    $scope.list_reviews = $scope.closed_reviews;
                }
            };

            $scope.init = function () {
                $scope.retrieveReviewsRequested();
                $scope.retrieveReviewsToConduct();
            };

            $scope.init();
        }]);
