Application.Controllers.controller('_toolbarDraftsReviewModal',
    ["$scope", "User", "pubsub", "mcapi", function ($scope, User, pubsub, mcapi) {

        $scope.newReview = function (userToReview, note) {
            var review = {};
            review.note = note;
            review.item_type = "draft";
            review.requested_by = User.u();
            review.requested_to = userToReview;
            review.item_name = $scope.draft.name;
            review.item_id = $scope.draft.id;
            review.project_id = $scope.draft.attributes.project_id;
            return review;
        };

        $scope.addReview = function (review) {
            mcapi('/reviews')
                .success(function () {
                    pubsub.send('reviews.change');
                }).post(review);
        };

        $scope.addReviewNoteKeypress = function () {
            var review = $scope.newReview(User.u(), $scope.reviewNoteSelf);
            $scope.addReview(review);
            $scope.reviewNoteSelf = "";
            $scope.dismissModal();
        };

        $scope.finish = function () {
            var review;
            if ($scope.reviewNoteOther !== "" && $scope.userForReview !== "") {
                review = $scope.newReview($scope.userForReview, $scope.reviewNoteOther);
                $scope.addReview(review);
            }
            $scope.reviewNoteOther = "";
            $scope.userForReview = "";
        };

        $scope.init = function () {
            mcapi('/selected_users')
                .success(function (data) {
                    $scope.users = data;
                }).jsonp();
        };

        $scope.init();
    }]);