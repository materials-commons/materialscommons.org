Application.Controllers.controller('projectCreatetReview',
    ["$scope", "project", "User",projectCreatetReview]);

function projectCreatetReview($scope, project,User) {

    $scope.project = project;
    $scope.user = User.u();
    $scope.today = new Date();
    $scope.model = {
        title: "",
        comment: ''
    };
}
