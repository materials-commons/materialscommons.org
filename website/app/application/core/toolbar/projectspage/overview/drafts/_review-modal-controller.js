Application.Controllers.controller('_toolbarDraftsReviewModal',
    ["$scope", "User", "pubsub", "mcapi", function ($scope, User, pubsub, mcapi) {

        function newReview (userToReview, note) {
            var review = {};
            review.note = note;
            review.item_type = "draft";
            review.requested_by = User.u();
            review.requested_to = userToReview;
            review.item_name = $scope.draft.name;
            review.item_id = $scope.draft.id;
            review.project_id = $scope.draft.project_id;
            return review;
        }

        function addReview(review) {
            mcapi('/reviews')
                .success(function () {
                    pubsub.send('reviews.change');
                }).post(review);
        }

        $scope.addReviewNoteKeypress = function () {
            var review = newReview(User.u(), $scope.reviewNoteSelf);
            addReview(review);
            $scope.reviewNoteSelf = "";
            $scope.dismissModal();
        };

        $scope.finish = function () {
            var review;
            if ($scope.reviewNoteOther !== "" && $scope.userForReview !== "") {
                review = newReview($scope.userForReview, $scope.reviewNoteOther);
                addReview(review);
            }
            $scope.reviewNoteOther = "";
            $scope.userForReview = "";
        };

        function init() {
            mcapi('/selected_users')
                .success(function (data) {
                    $scope.users = data;
                }).jsonp();
        }

        init();
    }]);