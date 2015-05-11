Application.Controllers.controller('projectEditReview',
    ["$scope", "project", "$stateParams","Review", "User",projectEditReview]);

function projectEditReview($scope, project, $stateParams,Review, User) {

    $scope.openReview = function(review){
        $scope.review = review;
    };
    $scope.addComment = function(){
        Review.addComment($scope.model,  $scope.review);
        $scope.model.comment = '';
    };
    $scope.archiveReview = function(){
        Review.closeReview($scope.review.id, project);
        $state.go('projects.project.reviews');
    };

    $scope.project = project;
    $scope.user = User.u();
    $scope.today = new Date();
    $scope.reviews = $scope.project.reviews;
    $scope.model = {
        title: "",
        comment: ''
    };

    function init(){
        if ($stateParams.review_id){
            $scope.review = Review.setActiveReview($stateParams.review_id, $scope.project.reviews);
        }   else{
            $scope.review = $scope.project.reviews[0];
        }
    }
    init();
}
