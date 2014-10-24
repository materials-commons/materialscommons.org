Application.Directives.directive('homeTasks', homeTasksDirective);
function homeTasksDirective() {
    return {
        restrict: "EA",
        controller: 'homeTasksDirectiveController',
        scope: {
            project: '=project'
        },
        templateUrl: 'application/core/projects/project/home/directives/home-tasks.html'
    };
}

Application.Controllers.controller("homeTasksDirectiveController",
                                   ["$scope",  homeTasksDirectiveController]);
function homeTasksDirectiveController($scope) {
}
