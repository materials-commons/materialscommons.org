Application.Directives.directive('sideboard', sideboardDirective);

function sideboardDirective() {
    return {
        scope: {},
        restrict: "E",
        templateUrl: "application/core/projects/overview/sideboard.html"
    };
}

Application.Controllers.controller('tagsSideboardController',
                                   ["$scope", "User",  tagsSideboardController]);

function tagsSideboardController($scope, User) {
    $scope.tags = User.attr().preferences.tags;
}

Application.Controllers.controller('todosSideboardController',
    ["$scope",  "$stateParams", "model.projects", todosSideboardController]);

function todosSideboardController($scope, $stateParams, Projects) {
    $scope.checkBox = function(index){
        $scope.todo.checked = true;
    }
    $scope.project_id = $stateParams.id;
    Projects.get($scope.project_id).then(function(project) {
        $scope.project = project;
        $scope.todos = project.todos;
        console.log($scope.todos)
    });

}
