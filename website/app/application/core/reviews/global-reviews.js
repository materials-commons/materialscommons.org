Application.Directives.directive('globalReviews', actionReviewsDirective);

function actionReviewsDirective() {
    return {
        controller: "globalReviewsController",
        restrict: "A",
        templateUrl: "application/core/reviews/global-reviews.html"
    };
}

Application.Controllers.controller('globalReviewsController',
                                   ["$scope", "User", "model.projects",
                                    "pubsub", globalReviewsController]);

function globalReviewsController($scope, User, Projects, pubsub) {
    pubsub.waitOn($scope, "reviews.change", function () {
        getAllReviews();
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

    function getAllReviews() {
        Projects.getList().then(function (projects) {
            $scope.reviews = [];
            projects.forEach(function(prj){
                if(prj.reviews.length!==0){
                    prj.reviews.forEach(function(r){
                        r.project_name = prj.name;
                        r.project_id = prj.id;
                    });
                    $scope.reviews = $scope.reviews.concat(prj.reviews);
                }
            });
        });
    }
    $scope.reviews = [];
    $scope.user = User.u();
}
