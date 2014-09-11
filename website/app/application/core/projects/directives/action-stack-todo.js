Application.Directives.directive('actionToDo', actionToDoDirective);

function actionToDoDirective() {
    return {
        controller: "actionStackToDoController",
        restrict: "A",
        templateUrl: "application/core/projects/directives/action-stack-todo.html"
    };
}

Application.Controllers.controller("actionStackToDoController",
    ["$scope",  "$stateParams",  "model.projects", "User", "toaster", actionStackToDoController]);

function actionStackToDoController($scope, $stateParams, Projects, User, toaster) {

    $scope.addToDo = function(){
        if ($scope.todo.title!==''){
            $scope.project.todos.push({'note': $scope.todo.note, 'title': $scope.todo.title, 'who': User.u(),'selected': false});
            $scope.saveData();
            toaster.pop('success', "ToDo:", "Todo has been added", 3000);
            $scope.reset();
        }else{
            toaster.pop('warning', "Note:", "Field: Title is required", 3000);
        }
    }
    $scope.saveData = function () {
        $scope.project.put(User.keyparam()).then(function() {

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
