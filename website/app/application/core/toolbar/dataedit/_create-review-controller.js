Application.Controllers.controller('_toolbarDataEditCreateReview',
    ["$scope", "mcapi", "User", "$stateParams", "alertService", "pubsub",
        function ($scope, mcapi, User, $stateParams, alertService, pubsub) {
            $scope.addReview = function () {
                var review = {};
                review.note = $scope.review_note;
                review.item_type = "datafile";
                review.requested_by = User.u();
                if ($scope.schedule_for_self) {
                    review.requested_to = User.u();
                } else {
                    review.requested_to = $scope.user_for_review;
                }
                review.item_name = $scope.doc.name;
                review.item_id = $scope.doc.id;
                mcapi('/reviews')
                    .success(function (data) {
                        var msg = "Review/Followup has been added";
                        $scope.data_file_id = data;
                        alertService.sendMessage(msg);
                        pubsub.send('reviews.change', 'review.change');
                        mcapi('/datafiles/%/reviews', $stateParams.id)
                            .success(function (reviews) {
                                $scope.all_reviews = reviews;
                                console.log($scope.all_reviews);
                            })
                            .error(function (e){
                                console.log('error')
                            }).jsonp();
                    }).post(review);
                $scope.schedule_for_self = false;
            };

            $scope.addReviewForOther = function () {
                $scope.review_note = $scope.review_note_other;
                $scope.review_note_other = "";
                $scope.addReview();
            };

            $scope.addReviewNoteKeypressCallback = function () {
                $scope.schedule_for_self = true;
                $scope.review_note = $scope.review_note_self;
                $scope.review_note_self = "";
                $scope.addReview();
            };

            $scope.reviewStatusChanged = function (index) {
                mcapi('/reviews/%', $scope.all_reviews[index].id)
                    .success(function () {
                        $scope.all_reviews.splice(index, 1);
                        pubsub.send('reviews.change', 'review.change');
                    }).delete();
            };

            $scope.init = function () {
                $scope.all_reviews = [];
                $scope.signed_in_user = User.u();
                $scope.review_note = "";
                $scope.schedule_for_self = false;
                $scope.signed_user = User.u();
                mcapi('/datafiles/%/reviews', $stateParams.id)
                    .success(function (reviews) {
                        $scope.all_reviews = reviews;
                    }).jsonp();

                mcapi('/selected_users')
                    .success(function (data) {
                        $scope.users = data;
                    }).jsonp();
            };

            $scope.init();

        }]);