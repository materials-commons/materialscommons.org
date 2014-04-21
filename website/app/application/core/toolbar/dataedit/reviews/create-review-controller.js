Application.Controllers.controller('toolbarDataEditCreateReview',
    ["$scope", "mcapi", "User", "$stateParams", "alertService", "pubsub",
        function ($scope, mcapi, User, $stateParams, alertService, pubsub) {
            $scope.model = {
                review_note_self: '',
                review_note_other: '',
                review_note: '',
                schedule_for_self: false,
                user_for_review: ''
            };

            $scope.addReview = function () {
                var review = {};
                review.note = $scope.model.review_note;
                review.item_type = "datafile";
                review.requested_by = User.u();
                if ($scope.model.schedule_for_self) {
                    review.requested_to = User.u();
                } else {
                    review.requested_to = $scope.model.user_for_review;
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
                            })
                            .error(function (e) {
                            }).jsonp();
                    }).post(review);
                $scope.model.schedule_for_self = false;
            };

            $scope.addReviewForOther = function () {
                $scope.model.review_note = $scope.model.review_note_other;
                $scope.addReview();
                $scope.model.review_note_other = "";
            };

            $scope.addReviewNoteKeypressCallback = function () {
                $scope.model.schedule_for_self = true;
                $scope.model.review_note = $scope.model.review_note_self;
                $scope.addReview();
                $scope.model.review_note_self = "";

            };

            $scope.reviewStatusChanged = function (index) {
                mcapi('/reviews/%', $scope.all_reviews[index].id)
                    .success(function () {
                        $scope.all_reviews.splice(index, 1);
                        pubsub.send('reviews.change', 'review.change');
                    }).delete();
            };



            $scope.reviewsCount = function () {
                mcapi('/reviews/to_conduct')
                    .success(function (data) {
                        $scope.reviewsToConduct = _.filter(data, function (item) {
                            if (item.status !== "Finished" && item.item_id === $stateParams.id) {
                                return item;
                            }
                        });
                    }).jsonp();
            };

            pubsub.waitOn($scope, 'reviews.change', function () {
                $scope.reviewsCount();
            });

            function init() {
                $scope.all_reviews = [];
                $scope.signed_in_user = User.u();
                $scope.signed_user = User.u();
                mcapi('/datafiles/%/reviews', $stateParams.id)
                    .success(function (reviews) {
                        $scope.all_reviews = reviews;
                    }).jsonp();
                mcapi('/selected_users')
                    .success(function (data) {
                        $scope.users = data;
                    }).jsonp();

                $scope.reviewsCount();

            }

            init();

        }]);