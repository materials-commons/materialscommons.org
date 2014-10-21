Application.Controllers.controller("homeReviewsController",
    ["$scope", "$filter", function ($scope, $filter) {

        $scope.reviewsCard = function () {
            $scope.open_reviews = $filter('reviewFilter')($scope.project.reviews, 'open');
            $scope.closed_reviews = $filter('reviewFilter')($scope.project.reviews, 'closed');
            //Recent reviews
            $scope.recent_reviews = $scope.open_reviews.slice(0, 4);
        }

        function init() {
            $scope.reviewsCard();
        }

        init();
    }]);
Application.Directives.directive('homeReviews',
    function () {
        return {
            restrict: "A",
            controller: 'homeReviewsController',
            scope: {
                project: '=project'
            },
            templateUrl: 'application/directives/home-reviews.html'
        };
    });