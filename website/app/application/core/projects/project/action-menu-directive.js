Application.Directives.directive('actionMenu', actionMenuDirective);

function actionMenuDirective() {
    return {
        scope: {
            title: "@",
            titleIcon: "@",
            titleCount: "=",
            menuItems: "="

        },
        controller: 'actionMenuDirectiveController',
        restrict: "AE",
        templateUrl: "application/core/projects/project/action-menu.html"
    };
}

Application.Controllers.controller('actionMenuDirectiveController',
                                   ["$scope", "projectColors", "actionStackTracker",
                                    actionMenuDirectiveController]);

function actionMenuDirectiveController($scope, projectColors, actionStackTracker) {


    $scope.menuItemActive = actionStackTracker.actionActive;
    $scope.colors = projectColors;
    // This is needed to toggle the menu closed when an item is selected.
    // This is a part of how ui-bootstrap interacts with the menus and
    // the menu item does an ng-click.
    $scope.status = {
        isopen: false
    };
}
