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
    // This is needed to toggle the menu closed when an item is selected.
    // This is a part of how ui-bootstrap interacts with the menus and
    // the menu item does an ng-click.
    $scope.status = {
        isopen: false
    };

    $scope.toggleAction = function(action) {
        $scope.status = false;
        actionStatus.toggleAction($scope.project.id, action);
        var active = actionStatus.isCurrentAction($scope.project.id, action);
        ui.setShowFiles($scope.project.id, !active);
    };
}
