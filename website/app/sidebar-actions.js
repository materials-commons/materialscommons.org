Application.Directives.directive("sidebarActions", sidebarActionsDirective);

function sidebarActionsDirective() {
    return {
        restrict: "AE",
        replace: true,
        templateUrl: "sidebar-actions.html",
        controller: "sidebarActionsDirectiveController"
    };
}

Application.Controllers.controller("sidebarActionsDirectiveController",
                                   ["$scope", sidebarActionsDirectiveController]);

function sidebarActionsDirectiveController($scope) {
    $scope.showProjectActions = true;
    $scope.activeAction = "home";

    $scope.isActionActive = function(action) {
        return $scope.activeAction == action;
    };

    $scope.setActionActive = function(action) {
        $scope.activeAction = action;
    };
}
