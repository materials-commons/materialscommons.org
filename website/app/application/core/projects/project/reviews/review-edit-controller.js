(function (module) {
    module.controller('projectEditReview', projectEditReview);
    projectEditReview.$inject = ["$scope", "project", "$stateParams", "Review", "User", "$filter", "modalInstance"];

    function projectEditReview($scope, project, $stateParams, Review, User, $filter, modalInstance) {

        $scope.openReview = function (review) {
            $scope.review = review;
        };
        $scope.addComment = function () {
            Review.addComment($scope.model, $scope.review);
            $scope.model.comment = '';
        };
        $scope.archiveReview = function () {
            Review.closeReview($scope.review.id, project);
        };

        $scope.openDetails = function (params, type) {
            modalInstance.openModal(params, type, project);
        };

        $scope.project = project;
        $scope.user = User.u();
        $scope.today = new Date();
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
