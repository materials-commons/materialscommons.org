Application.Controllers.controller('_toolbarDraftsReviewModal',
    ["$scope", "User", "pubsub", "mcapi",  '$modalInstance', 'draft', function ($scope, User, pubsub, mcapi, $modalInstance, draft ) {

        function newReview (userToReview, note) {
            var review = {};
            review.note = note;
            review.item_type = "draft";
            review.requested_by = User.u();
            review.requested_to = userToReview;
            review.item_name = $scope.selected.item.process.name;
            review.item_id = $scope.selected.item.id;
            review.project_id = $scope.selected.item.project_id;
            return review;
        }

        function addReview(review) {
            mcapi('/reviews')
                .success(function () {
                    pubsub.send('reviews.change');
                }).post(review);
            $modalInstance.close($scope.selected.item);
        }


        $scope.addReviewForOther = function () {
            var review;
            if ($scope.bk.reviewNoteOther !== "" && $scope.bk.userForReview !== "") {
                review = newReview($scope.bk.userForReview, $scope.bk.reviewNoteOther);
                addReview(review);
            }
            $scope.bk.reviewNoteOther = "";
            $scope.bk.userForReview = "";
        };

        $scope.selected = {
            item: draft
        };



        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };

        function init() {
            $scope.bk = {
                reviewNoteOther: '',
                userForReview: ''
            }
            mcapi('/selected_users')
                .success(function (data) {
                    $scope.users = data;
                }).jsonp();
        }

        init();
    }]);