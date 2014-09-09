Application.Directives.directive('actionToDo', actionToDoDirective);

function actionToDoDirective() {
    return {
        controller: "actionStackToDoController",
        restrict: "A",
        templateUrl: "application/core/projects/directives/action-stack-create-todo.html"
    };
}

Application.Controllers.controller("actionStackToDoController",
    ["$scope", "mcapi", "User", "pubsub", actionStackToDoController]);

function actionStackToDoController($scope, mcapi, User, pubsub) {


    function init() {
        $scope.todo = {
            title: '',
            note: ''
        }
    }

    init();
}
