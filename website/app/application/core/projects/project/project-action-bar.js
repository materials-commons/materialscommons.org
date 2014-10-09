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
                                   ["$scope", "actionStatus", "ui",
                                    projectActionBarDirectiveController]);

function projectActionBarDirectiveController($scope, actionStatus, ui) {
    $scope.toggleAction = function(action) {
        actionStatus.toggleAction($scope.project.id, action);
        var active = actionStatus.isCurrentAction($scope.project.id, action);
        ui.setShowFiles($scope.project.id, !active);
        ui.setShowToolbarTabs($scope.project.id, !active);
    };
}
