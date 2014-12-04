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
                                   ["$scope", "Events", "pubsub",
                                    homeReviewsDirectiveController]);
function homeReviewsDirectiveController ($scope,  Events, pubsub) {
    $scope.reviews = [];
    $scope.service = Events.getService();
    $scope.reviews = $scope.service.reviews;
    pubsub.waitOn($scope, "clicked_date", function(date) {
        $scope.clicked_date = date;
        $scope.reviews = Events.getEventsByDate($scope.service.grouped_reviews, $scope.clicked_date);
    });
}
