Application.Directives.directive('projectActionBar', projectActionBarDirective);

function projectActionBarDirective() {
    return {
        scope: {
            project: "="
        },
        controller: "projectActionBarDirectiveController",
        restrict: "AE",
        templateUrl: "application/core/projects/project/project-action-bar.html"
    };
}

Application.Controllers.controller('projectActionBarDirectiveController',
                                   ["$scope", "actionStatus",
                                    projectActionBarDirectiveController]);

function projectActionBarDirectiveController($scope, actionStatus) {
    $scope.toggleAction = function(action) {
        actionStatus.toggleAction($scope.project.id, action);
    };
}
