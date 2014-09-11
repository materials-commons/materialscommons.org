Application.Directives.directive('actionToDo', actionToDoDirective);

function actionToDoDirective() {
    return {
        controller: "actionStackToDoController",
        restrict: "A",
        templateUrl: "application/core/projects/directives/action-stack-todo.html"
    };
}

Application.Controllers.controller("actionStackToDoController",
    ["$scope",  "$stateParams",  "model.projects", "User", "toastr", actionStackToDoController]);

function actionStackToDoController($scope, $stateParams, Projects, User, toastr) {

    $scope.addToDo = function(){
            $scope.project.todos.push({'note': $scope.todo.note, 'title': $scope.todo.title, 'who': User.u(),'selected': false});
            $scope.saveData();
            $scope.reset();
            $scope.toggleStackAction('to-do', 'Create ToDo')
    }
    $scope.saveData = function () {
        $scope.project.put(User.keyparam()).then(function() {
        }, function(reason){
           toastr.error(reason.data.error, 'Error', {
               closeButton: true
           });
        });
    };


    $scope.reset = function(){
        $scope.todo = {
            title: '',
            note: ''
        }
    };

    $scope.init =  function() {
        $scope.project_id = $stateParams.id;
        Projects.get($scope.project_id).then(function(project) {
            $scope.project = project;
        });
        $scope.reset();

    }

    $scope.init();
}
