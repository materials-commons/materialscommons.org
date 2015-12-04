(function (module) {
    module.controller('projectCreateReview', projectCreateReview);
    projectCreateReview.$inject = ["$scope", "project", "User", "pubsub", "$modal", "Review", "mcapi", "$state",
        "$filter", "mcmodal"];

    function projectCreateReview($scope, project, User, pubsub, $modal, Review, mcapi, $state, $filter, mcmodal) {
        var ctrl = this;

        ctrl.project = project;
        ctrl.users = [];
        ctrl.project.users.forEach(function (u) {
            ctrl.users.push(u.user_id);
        });
        ctrl.user = User.u();
        ctrl.today = new Date();
        ctrl.model = {
            title: "",
            comment: '',
            assigned_to: [],
            attachments: []
        };
        ctrl.modal = {
            instance: null,
            items: []
        };
        //ctrl.selectedUser = '';

        ctrl.addUser = addUser;
        ctrl.removeUser = removeUser;
        ctrl.removeAttachment = removeAttachment;
        ctrl.addAttachment = addAttachment;
        ctrl.open = open;
        ctrl.createReview = createReview;
        ctrl.saveData = saveData;
        ctrl.openDetails = openDetails;
        ctrl.cancel = cancel;

        pubsub.waitOn($scope, 'addSampleToReview', function (sample) {
            addAttachment(sample);
        });

        pubsub.waitOn($scope, 'addProcessToReview', function (process) {
            addAttachment(process);
        });

        pubsub.waitOn($scope, 'addFileToReview', function (file) {
            addAttachment(file);
        });

        function addUser() {
            ctrl.model.assigned_to.push(ctrl.selectedUser);
            var i = _.indexOf(ctrl.users, function (user) {
                return user === ctrl.selectedUser;
            });
            if (i > -1) {
                ctrl.users.splice(i, 1);
            }
        }

        function removeUser(user) {
            var i = _.indexOf(ctrl.model.assigned_to, user);
            ctrl.model.assigned_to.splice(i, 1);
            ctrl.users.push(user);
            ctrl.selectedUser = '';
        }

        function removeAttachment(item) {
            Review.checkedItems(item);
            addAttachment(item);
        }

        function addAttachment(item) {
            var i = _.indexOf(ctrl.model.attachments, function (entry) {
                return item.id === entry.id;
            });
            if (i < 0) {
                ctrl.model.attachments.push(item);
            } else {
                ctrl.model.attachments.splice(i, 1);
            }
        }

        function open(size) {
            ctrl.modal.instance = $modal.open({
                templateUrl: 'application/core/projects/project/reviews/myModalContent.html',
                controller: 'ModalInstanceCtrl',
                size: size,
                resolve: {
                    modal: function () {
                        return ctrl.modal;
                    },
                    project: function () {
                        return ctrl.project;
                    }
                }
            });
        }

        function createReview(isValid) {
            if (isValid) {
                ctrl.review = {messages: [], attachments: []};
                ctrl.review.author = User.u();
                ctrl.review.assigned_to = ctrl.model.assigned_to;
                ctrl.review.status = 'open';
                ctrl.review.title = ctrl.model.title;
                ctrl.review.attachments = ctrl.model.attachments;
                var newdate = new Date();
                ctrl.review.messages.push({
                    'message': ctrl.model.comment,
                    'who': User.u(),
                    'date': newdate.toDateString()
                });
                ctrl.review.project = ctrl.project.id;
                saveData();
            }

        }

        function saveData() {
            mcapi('/reviews')
                .success(function (review) {
                    ctrl.project.reviews.unshift(review);
                    ctrl.reviews = $filter('byKey')(ctrl.project.reviews, 'status', 'open');
                    Review.setReviews(ctrl.reviews);
                    $state.go('projects.project.reviews.list.view', {category: 'all', review_id: review.id});
                }).error(function () {
                }).post(ctrl.review);
        }

        function openDetails(params) {
            mcmodal.openModal(params, project);
        }

        function cancel() {
            $state.go('projects.project.reviews.list', {category: 'all'});

        }

    }
}(angular.module('materialscommons')));
