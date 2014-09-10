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
            toaster.pop('success', "Note:", "Notes has been saved", 3000);
        }else{
            toaster.pop('warning', "Note:", "Empty note", 3000);
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
