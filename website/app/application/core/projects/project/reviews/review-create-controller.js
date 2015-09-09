(function (module) {
    module.controller('projectCreateReview', projectCreateReview);
    projectCreateReview.$inject = ["$scope", "project", "User", "pubsub", "$modal", "Review", "mcapi", "$state",
        "$filter", "modalInstance"];

    function projectCreateReview($scope, project, User, pubsub, $modal, Review, mcapi, $state, $filter, modalInstance) {

        pubsub.waitOn($scope, 'addSampleToReview', function (sample) {
            addAttachment(sample);
        });

        pubsub.waitOn($scope, 'addProcessToReview', function (process) {
            addAttachment(process);
        });

        pubsub.waitOn($scope, 'addFileToReview', function (file) {
            addAttachment(file);
        });

        $scope.addUser = function () {
            $scope.model.assigned_to.push($scope.selectedUser);
            var i = _.indexOf($scope.users, function (user) {
                return user === $scope.selectedUser;
            });
            if (i > -1) {
                $scope.users.splice(i, 1);
            }
        };

        $scope.removeUser = function (user) {
            var i = _.indexOf($scope.model.assigned_to, user);
            $scope.model.assigned_to.splice(i, 1);
            $scope.users.push(user);
            $scope.selectedUser = '';
        };

        $scope.removeAttachment = function (item) {
            Review.checkedItems(item);
            addAttachment(item);
        };

        function addAttachment(item) {
            var i = _.indexOf($scope.model.attachments, function (entry) {
                return item.id === entry.id;
            });
            if (i < 0) {
                $scope.model.attachments.push(item);
            } else {
                $scope.model.attachments.splice(i, 1);
            }
        }

        $scope.open = function (size) {
            $scope.modal.instance = $modal.open({
                templateUrl: 'application/core/projects/project/reviews/myModalContent.html',
                controller: 'ModalInstanceCtrl',
                size: size,
                resolve: {
                    modal: function () {
                        return $scope.modal;
                    },
                    project: function () {
                        return $scope.project;
                    }
                }
            });
        };

        $scope.createReview = function (isValid) {
            if (!isValid) {
                return;
            }
            else {
                $scope.review = {messages: [], attachments: []};
                $scope.review.author = User.u();
                $scope.review.assigned_to = $scope.model.assigned_to;
                $scope.review.status = 'open';
                $scope.review.title = $scope.model.title;
                $scope.review.attachments = $scope.model.attachments;
                var newdate = new Date();
                $scope.review.messages.push({
                    'message': $scope.model.comment,
                    'who': User.u(),
                    'date': newdate.toDateString()
                });
                $scope.review.project = $scope.project.id;
                saveData();
            }

        };

        function saveData() {
            mcapi('/reviews')
                .success(function (review) {
                    init();
                    $scope.project.reviews.unshift(review);
                    $scope.reviews = $filter('byKey')($scope.project.reviews, 'status', 'open');
                    Review.setReviews($scope.reviews);
                    $state.go('projects.project.reviews.edit', {category: 'all', review_id: review.id});
                }).error(function (reason) {
                }).post($scope.review);
        }

        $scope.openDetails = function (params) {
            modalInstance.openModal(params, project);
        };

        $scope.cancel = function () {
            $state.go('projects.project.reviews.edit', {category: 'all'});
        };

        function init() {
            $scope.project = project;
            $scope.users = [];
            $scope.project.users.forEach(function (u) {
                $scope.users.push(u.user_id);
            });
            $scope.user = User.u();
            $scope.today = new Date();
            $scope.model = {
                title: "",
                comment: '',
                assigned_to: [],
                attachments: []
            };
            $scope.modal = {
                instance: null,
                items: []
            };
        }

        init();
    }
}(angular.module('materialscommons')));
