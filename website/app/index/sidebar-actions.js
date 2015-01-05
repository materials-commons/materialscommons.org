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

    $scope.isActionActive = function (action) {
        return $scope.activeAction === action;
    };

    $scope.setActionActive = function (action) {
        homeCustomize.setInfoBox(action);
    };

    $scope.getActionActive = function (what) {
        return homeCustomize.getInfoBox(what);
    };
}
