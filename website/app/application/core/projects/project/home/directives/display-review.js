Application.Directives.directive("displayReview", displayReviewDirective);
function displayReviewDirective() {
    return {
        restrict: "E",
        replace: true,
        scope: {
            review: "=review",
            showSideboard: "=showSideboard"
        },
        controller: "displayReviewDirectiveController",
        templateUrl: "application/core/projects/project/home/directives/display-review.html"
    };
}
Application.Controllers.controller("displayReviewDirectiveController",
                                   ["$scope", "sideboard", "current",
                                    displayReviewDirectiveController]);

function displayReviewDirectiveController($scope, sideboard, current) {
    $scope.addToSideboard = function(review, event) {
        sideboard.handleFromEvent(current.projectID(), review, event, 'sideboard');
    };
    $scope.remove = function (review, event) {
        sideboard.handleFromEvent(current.projectID(), review, event, 'sideboard');
    };

}
