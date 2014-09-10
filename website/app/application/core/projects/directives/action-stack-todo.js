Application.Directives.directive('actionToDo', actionToDoDirective);

function actionToDoDirective() {
    return {
        controller: "actionStackToDoController",
        restrict: "A",
        templateUrl: "application/core/projects/directives/action-stack-todo.html"
    };
}

Application.Controllers.controller("actionStackToDoController",
    ["$scope",  "$stateParams",  "model.projects", "User","dateGenerate","toaster", actionStackToDoController]);

function actionStackToDoController($scope, $stateParams, Projects, User, dateGenerate, toaster) {

    $scope.addToDo = function(){
        if ($scope.todo.title!==''){
            $scope.project.todos.push({'note': $scope.todo.note, 'who': User.u(), 'date': dateGenerate.new_date()});
            $scope.saveData();
            $scope.reset();
        }else{
            toaster.pop('warning', "Note:", "Field: title is required", 3000);
        }
    }
    $scope.saveData = function () {
        $scope.project.put(User.keyparam()).then(function() {
            toaster.pop('success', "ToDo:", "Todo has been added", 3000);

        });
    };

    $scope.reset = function(){
        $scope.todo = {
            title: '',
            note: ''
        }
    }

    $scope.init =  function() {
        $scope.project_id = $stateParams.id;
        Projects.get($scope.project_id).then(function(project) {
            $scope.project = project;
        });
        $scope.reset();

    }

    $scope.init();
}
