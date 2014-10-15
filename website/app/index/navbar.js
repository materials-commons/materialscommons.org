Application.Directives.directive("navbar", navbarDirective);

function navbarDirective() {
    return {
        scope: true,
        restrict: "AE",
        replace: true,
        templateUrl: "index/navbar.html",
        controller: "navbarDirectiveController"
    };
}

Application.Controllers.controller("navbarDirectiveController",
                                   ["$scope", "actionStatus", "ui", "current",
                                    navbarDirectiveController]);

function navbarDirectiveController($scope, actionStatus, ui, current) {
    // This is needed to toggle the menu closed when an item is selected.
    // This is a part of how ui-bootstrap interacts with the menus and
    // the menu item does an ng-click.
    $scope.status = {
        isopen: false
    };

    $scope.toggleAction = function(action) {
        var projectID = current.projectID();
        var active = actionStatus.isCurrentAction(projectID, action);
        $scope.status = false;
        actionStatus.toggleAction(projectID, action);
        ui.setShowFiles(projectID, !active);
        ui.setShowToolbarTabs(projectID, !active);
    };
}
