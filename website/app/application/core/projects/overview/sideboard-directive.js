Application.Directives.directive('sideboard', sideboardDirective);

function sideboardDirective() {
    return {
        scope: {},
        restrict: "E",
        templateUrl: "application/core/projects/overview/sideboard.html"
    };
}

Application.Controllers.controller('tagsSideboardController',
                                   ["$scope", "User", "$stateParams", "model.projects", tagsSideboardController]);

function tagsSideboardController($scope, User, $stateParams, Projects) {
    $scope.tags = User.attr().preferences.tags;
    $scope.project_id = $stateParams.id;
    Projects.get($scope.project_id).then(function(project) {
        $scope.project = project;
        $scope.todos = project.todos;
    });
}
