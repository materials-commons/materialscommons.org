Application.Controllers.controller("projectReviewsEdit",
    ["$scope", "project", "$stateParams", "mcapi", "$state", "Review", projectReviewsEdit]);

        function projectReviewsEdit($scope, project, $stateParams, mcapi, $state, Review) {
            $scope.project = project;

            $scope.editReview = function (index) {
                $scope.edit_index = index;
            };

            $scope.saveReview = function (index) {
                if ($scope.review.messages[index].message === "") {
                    return;
                }
                $scope.edit_index = -1;
                mcapi('/reviews/%', $scope.review.id)
                    .success(function (data) {
                    }).put({'messages': $scope.review.messages});
            };

            $scope.addComment = function () {
                Review.addComment($scope.model, $scope.review);
            };

            $scope.closeReview = function () {
                Review.closeReview($scope.review.id, project);
                $state.go('projects.project.reviews.overview');
            };

            $scope.reOpenReview = function () {
                Review.openReview($scope.review.id, project);
                $state.go('projects.project.reviews.overview');
            };

            function init() {
                var review_id = $stateParams.review_id;
                $scope.review = Review.findReview(review_id, 'reviews', project);
            }

            init();
        }
