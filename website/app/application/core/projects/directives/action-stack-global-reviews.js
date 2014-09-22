Application.Directives.directive('actionGlobalReviews', actionReviewsDirective);

function actionReviewsDirective() {
    return {
        controller: "actionGlobalReviewsController",
        restrict: "A",
        templateUrl: "application/core/projects/directives/action-stack-global-reviews.html"
    };
}

Application.Controllers.controller('actionGlobalReviewsController',
    ["$scope","$filter", "User", "model.projects", "pubsub", actionGlobalReviewsController]);

function actionGlobalReviewsController($scope, $filter,  User, Projects, pubsub) {
    pubsub.waitOn($scope, "update-tab-count.change", function () {
        $scope.getAllReviews();
    });

    $scope.createName = function(name) {
        if (name.length > 15) {
            return name.substring(0,12)+"...";
        }
        return name;
    };

    $scope.getProjectName = function(id) {
        Projects.get(id).then(function (project) {
            $scope.project = project;
        });
        return $scope.project.name;
    };

    $scope.getAllReviews = function(){
        var unflatten = [];
        $scope.all_reviews = [];

        Projects.getList().then(function (projects) {
            projects.forEach(function(prj){
                if(prj.reviews.length!==0){
                    prj.reviews.forEach(function(r){
                        r.project_name = prj.name;
                    });
                    unflatten.push(prj.reviews);
                }
            });
            $scope.all_reviews = $scope.all_reviews.concat.apply($scope.all_reviews, unflatten);
            $scope.count = $filter('byKey')( $scope.all_reviews, 'status', 'open').length;
        });
    };

    function init() {
        $scope.user = User.u();
        $scope.getAllReviews();
    }

    init();
}
