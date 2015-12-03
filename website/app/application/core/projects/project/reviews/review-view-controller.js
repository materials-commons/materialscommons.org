(function (module) {
    module.controller('projectViewReview', projectViewReview);
    projectViewReview.$inject = ["$scope", "project", "$stateParams", "Review", "User", "$filter", "mcmodal"];

    function projectViewReview($scope, project, $stateParams, Review, User, $filter, mcmodal) {

        var ctrl = this;
        ctrl.project = project;
        ctrl.user = User.u();
        ctrl.today = new Date();

        ctrl.openReview = openReview;
        ctrl.addComment = addComment;
        ctrl.archiveReview = archiveReview;
        ctrl.openDetails = openDetails;

        function openReview(review) {
            $scope.review = review;
        }

        function addComment() {
            Review.addComment($scope.model, $scope.review);
            $scope.model.comment = '';
        }

        function archiveReview() {
            Review.closeReview($scope.review.id, project);
        }

        function openDetails(params, type) {
            mcmodal.openModal(params, type, project);
        }

        //$scope.project = project;
        //$scope.user = User.u();
        //$scope.today = new Date();
        $scope.model = {
            title: "",
            comment: ''
        };

        function init() {
            if ($stateParams.review_id) {
                if ($stateParams.category === 'due') {
                    $scope.reviews = $filter('byKey')($scope.project.reviews, 'assigned_to', User.u());
                } else if ($stateParams.category === 'closed') {
                    $scope.reviews = $filter('byKey')($scope.project.reviews, 'status', 'closed');
                } else {
                    $scope.reviews = $filter('byKey')($scope.project.reviews, 'status', 'open');
                }

                var i = _.indexOf($scope.reviews, function (rev) {
                    return $stateParams.review_id === rev.id;
                });
                if (i !== -1) {
                    $scope.review = $scope.reviews[i];
                    Review.setActiveReview($scope.review);
                }
            }
        }

        init();
    }
}(angular.module('materialscommons')));
