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
    ["$scope", "ui", "current", "$state", sidebarActionsDirectiveController]);

function sidebarActionsDirectiveController($scope, ui, current, $state) {
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

    $scope.showProjects = false;

    $scope.setProject = function (project) {
        $scope.project = project;
        current.setProject(project);
        $scope.showProjects = false;
        $state.go("projects.project.home", {id: project.id});
    };

    $scope.showSettings = function () {
        $scope.project = current.project();
        $state.go("projects.project.access", {id: $scope.project.id});
    };

    $scope.goHome = function () {
        $scope.project = current.project();
        ui.resetPanels($scope.project.id);
        $state.go("projects.project.home", {id: $scope.project.id});
    };
}
