Application.Directives.directive('projectActionArea', projectActionAreaDirective);

function projectActionAreaDirective() {
    return {
        scope: {
            project: "="
        },
        controller: projectActionAreaDirectiveController,
        restrict: "AE",
        templateUrl: "application/core/projects/project/project-action-area.html"
    };
}

Application.Controllers.controller('projectActionAreaDirectiveController',
                                   ["$scope", "actionStatus",
                                    projectActionAreaDirectiveController]);

function projectActionAreaDirectiveController($scope, actionStatus) {
    $scope.isCurrentAction = function(action) {
        return actionStatus.isCurrentAction($scope.project.id, action);
    };
}
