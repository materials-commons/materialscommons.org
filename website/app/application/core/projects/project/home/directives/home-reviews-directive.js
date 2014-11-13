Application.Directives.directive('homeReviews', homeReviewsDirective);
function homeReviewsDirective () {
    return {
        restrict: "EA",
        controller: 'homeReviewsDirectiveController',
        scope: {
            project: '=project'
        },
        templateUrl: 'application/core/projects/project/home/directives/home-reviews.html'
    };
}

Application.Controllers.controller("homeReviewsDirectiveController",
                                   ["$scope", "User", "projectState", "$state",
                                    homeReviewsDirectiveController]);
function homeReviewsDirectiveController ($scope, User, projectState, $state) {
    function computeRecentReviews() {
        //Recent reviews
        var lastLogin = new Date($scope.user.last_login.epoch_time * 1000);
        $scope.recent_reviews = [];
        $scope.project.open_reviews.forEach(function(item) {
            var reviewTime = new Date(item.mtime.epoch_time * 1000);
            if (reviewTime > lastLogin) {
                $scope.recent_reviews.push(item);
            }
        });
    }

    $scope.addReview = function() {
        var stateID = projectState.add($scope.project.id);
        $state.go("projects.project.reviews.create", {sid: stateID});
    };

    $scope.user = User.attr();
    computeRecentReviews();
}
