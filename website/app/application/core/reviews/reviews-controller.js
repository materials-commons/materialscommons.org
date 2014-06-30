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

            $scope.removeReviewToConduct = function (index) {
                mcapi('/reviews/%', $scope.reviewsToConduct[index].id)
                    .success(function () {
                        $scope.reviewsToConduct.splice(index, 1);
                        pubsub.send('reviews.change', 'review.change');
                    }).delete();
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
                    $state.go('toolbar.projectspage.dataedit.reviews', {data_id: review.item_id, from: 'datafile', file_path: 'global'});
                    break;
                case "draft":
                    $state.go('toolbar.projectspage.overview.drafts', {id: review.project_id, draft_id: review.item_id});
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
