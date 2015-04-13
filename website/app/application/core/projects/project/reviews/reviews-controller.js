Application.Controllers.controller('projectReviews',
    ["$scope", "project", "ui", "User", "$filter" , "Review", projectReviews]);

function projectReviews($scope, project, ui, User, $filter, Review) {

    $scope.showPanel = function (what) {
        return ui.showPanel(project.id, what);
    };
    $scope.openPanel = function (panel) {
        ui.togglePanelState(project.id, panel);
    };
    $scope.project = project;

    $scope.openReview = function(review){
      $scope.review = review;
    };
    $scope.addComment = function(){
        Review.addComment($scope.model,  $scope.review);
    };

    $scope.listReviewsByType = function(type){
        $scope.type = type;
        switch (type){
            case "all_reviews":
                $scope.reviews = $scope.project.reviews;
                break;
            case "my_reviews":
                $scope.reviews = $filter('byKey')($scope.project.reviews, 'author', $scope.user);
                break;
            case "closed_reviews":
                $scope.reviews = $filter('byKey')($scope.project.reviews, 'status', 'closed');
                break;
        }
    };
    $scope.user = User.u();
    $scope.today = new Date();
    $scope.reviews = $scope.project.reviews;
    $scope.model = {
        comment: ''
    };
}
