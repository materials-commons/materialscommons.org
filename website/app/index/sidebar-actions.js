Application.Directives.directive("sidebarActions", sidebarActionsDirective);

function sidebarActionsDirective() {
    return {
        restrict: "AE",
        replace: true,
        templateUrl: "index/sidebar-actions.html",
        controller: "sidebarActionsDirectiveController"
    };
}

Application.Controllers.controller("sidebarActionsDirectiveController",
    ["$scope",  "homeCustomize", sidebarActionsDirectiveController]);

function sidebarActionsDirectiveController($scope, homeCustomize) {
    $scope.showProjectActions = true;
    $scope.activeAction = "home";

    $scope.isPanelActive = function (action) {
        return $scope.activeAction === action;
    };

    $scope.setActivePanel = function (action) {
        homeCustomize.setPanelState(action);
    };

    $scope.getActivePanel = function (what) {
        return homeCustomize.showPanel(what);
    };
}
