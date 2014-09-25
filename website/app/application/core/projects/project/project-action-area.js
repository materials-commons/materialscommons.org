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
                                   ["$scope", "actionStatus", "$stateParams",
                                    projectActionAreaDirectiveController]);

function projectActionAreaDirectiveController($scope, actionStatus, $stateParams) {
    $scope.isCurrentAction = function(action) {
        return actionStatus.isCurrentAction($stateParams.id, action);
    };
}
