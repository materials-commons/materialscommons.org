Application.Controllers.controller('projectCreatetReview',
    ["$scope", "project", "User",projectCreatetReview]);

function projectCreatetReview($scope, project,User) {

    $scope.project = project;
    $scope.user = User.u();
    $scope.today = new Date();
    $scope.model = {
        title: "",
        comment: '',
        assigned_to: [],
        attachments: ''
    };


    $scope.addUser = function(){
        $scope.model.assigned_to.push($scope.selectedUser);
    };
    $scope.removeUser = function(user){
       var i =  _.indexOf($scope.model.assigned_to, user);
       $scope.model.assigned_to.splice(i, 1);

    };
}
