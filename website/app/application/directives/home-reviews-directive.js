Application.Controllers.controller("homeReviewsController",
    ["$scope", "$filter", "User", function ($scope, $filter, User) {

        $scope.reviewsCard = function () {
            $scope.open_reviews = $filter('reviewFilter')($scope.project.reviews, 'open');
            $scope.closed_reviews = $filter('reviewFilter')($scope.project.reviews, 'closed');
            //Recent reviews
            var y = new Date($scope.user.last_login.epoch_time * 1000).toString();
            $scope.recent_reviews = [];
            $scope.project.reviews.forEach(function(item){
                var x = new Date(item.modifiedtime.epoch_time * 1000).toString();
                if(x > y) {
                    $scope.recent_reviews.push(item);
                }
            })

        }

        function init() {
            $scope.user = User.attr();
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