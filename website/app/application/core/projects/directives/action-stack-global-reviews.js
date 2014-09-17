Application.Directives.directive('actionGlobalReviews', actionReviewsDirective);

function actionReviewsDirective() {
    return {
        controller: "actionGlobalReviewsController",
        restrict: "A",
        templateUrl: "application/core/projects/directives/action-stack-global-reviews.html"
    };
}

Application.Controllers.controller('actionGlobalReviewsController',
    ["$scope","$filter", "User", "model.projects", actionGlobalReviewsController]);

function actionGlobalReviewsController($scope, $filter,  User, Projects) {


    function init() {
        $scope.user = User.u();
        var unflatten = [];
        $scope.all_reviews = [];
        Projects.getList(true).then(function (projects) {
            projects.forEach(function(prj){
                if(prj.reviews.length!==0){
                    unflatten.push(prj.reviews);
                }
            })
            $scope.all_reviews = $scope.all_reviews.concat.apply($scope.all_reviews, unflatten);
            $scope.to_conduct = $filter('byKey')($scope.all_reviews, 'assigned_to', User.u());
            $scope.to_conduct_open = $filter('byKey')($scope.to_conduct, 'status', 'open');
            $scope.to_conduct_closed = $filter('byKey')($scope.to_conduct, 'status', 'close');
            $scope.requested = $filter('byKey')($scope.all_reviews, 'author', User.u());
            $scope.requested_open = $filter('byKey')($scope.requested, 'status', 'open');
            $scope.requested_closed = $filter('byKey')($scope.requested, 'status', 'close');
            console.log($scope.all_reviews)
        });

    }

    init();
}
