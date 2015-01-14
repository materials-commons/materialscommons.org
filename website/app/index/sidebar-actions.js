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
    ["$scope", "ui", sidebarActionsDirectiveController]);

function sidebarActionsDirectiveController($scope, ui) {
    $scope.showProjectActions = true;
    $scope.activeAction = "home";
    $scope.isPanelActive = function (action) {
        return $scope.activeAction === action;
    };

    $scope.toggleActivePanel = function (action) {
        ui.togglePanelState(action, $scope.project.id);
    };

    $scope.getActivePanel = function (what) {
        if ($scope.project) {
            return ui.showPanel(what, $scope.project.id);
        }
        return true;
    };
}
