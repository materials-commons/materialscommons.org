Application.Controllers.controller('toolbarDataEditCreateReview',
    ["$scope", "mcapi", "User", "$stateParams", "alertService", "pubsub",
        function ($scope, mcapi, User, $stateParams, alertService, pubsub) {
            $scope.all_reviews = [];
            $scope.signed_in_user = User.u();
            $scope.review_note = "";
            $scope.schedule_for_self = false;
            $scope.signed_user = User.u();
            mcapi('/datafile/%/reviews', $stateParams.id)
                .success(function (data) {
                    data.forEach(function (item) {
                        $scope.all_reviews.push(item.right);
                    })
                }).jsonp();

            mcapi('/selected_users')
                .success(function (data) {
                    $scope.users = data;
                }).jsonp();


            $scope.addReview = function () {
                var review = {};
                review.note = $scope.review_note;
                review.item_type = "data";
                review.status = "InProcess";
                review.requested_by = User.u();
                if ($scope.schedule_for_self) {
                    review.requested_to = User.u();
                }
                else {
                    review.requested_to = $scope.user_for_review;
                }
                review.item_name = $scope.doc.name;
                review.item_id = $scope.doc.id;
                mcapi('/review')
                    .success(function (data) {
                        $scope.all_reviews = [];
                        $scope.data_file_id = data;
                        $scope.msg = "Review/Followup has been added";
                        alertService.sendMessage($scope.msg);
                        pubsub.send('reviews.change', 'review.change');
                        mcapi('/datafile/%/reviews', $scope.data_file_id)
                            .success(function (data) {
                                data.forEach(function (item) {
                                    $scope.all_reviews.push(item.right);
                                });
                            }).jsonp();
                    }).post(review);
                $scope.schedule_for_self = false;
            }

            $scope.addReviewForOther = function () {
                $scope.review_note = $scope.review_note_other;
                $scope.review_note_other = "";
                $scope.addReview();
            }

            $scope.addReviewNoteKeypressCallback = function (event) {
                $scope.schedule_for_self = true;
                $scope.review_note = $scope.review_note_self;
                $scope.review_note_self = "";
                $scope.addReview();
            }

            $scope.reviewStatusChanged = function (index) {
                if ($scope.all_reviews[index].status == 'InProcess') {
                    var set_status = 'Finished';

                }
                else {
                    var set_status = 'InProcess'
                }
                mcapi('/review/%/mark/%', $scope.all_reviews[index].id, set_status)
                    .success(function () {
                        $scope.msg = "Review Status has been changed"
                        alertService.sendMessage($scope.msg);
                        pubsub.send('reviews.change', 'review.change')
                    }).put();
            }

        }]);