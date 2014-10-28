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
                                   ["$scope", "$state", "pubsub", "$filter", "current",
                                    sidebarActionsDirectiveController]);

function sidebarActionsDirectiveController($scope, $state, pubsub, $filter, current) {
    $scope.showProjectActions = true;
    $scope.activeAction = "home";

    $scope.isActionActive = function(action) {
        return $scope.activeAction == action;
    };

    $scope.setActionActive = function(action) {
        $scope.activeAction = action;
        if (action !== "home") {
            // append overview to route
            action += ".overview";
        }
        $state.go("projects.project." + action, {id: $scope.project.id});
    };
}
