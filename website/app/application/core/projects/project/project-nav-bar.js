Application.Directives.directive("projectNavBar", projectNavBarDirective);
function projectNavBarDirective() {
    return {
        restrict: "E",
        replace: true,
        scope: {
            project: "=project",
            projects: "=projects"
        },
        controller: "projectNavBarDirectiveController",
        templateUrl: "application/core/projects/project/project-nav-bar.html"
    };
}

Application.Controllers.controller("projectNavBarDirectiveController",
    ["$scope", "current", "$state", "ui", "User", "sideboard", "navBarState",
        projectNavBarDirectiveController]);
function projectNavBarDirectiveController($scope, current, $state, ui, User, sideboard, navBarState) {
    $scope.setProject = function (project) {
        current.setProject(project);
        $scope.showProjects = false;
        $state.go("projects.project.home", {id: project.id});
    };

    $scope.isMinimized = function (panel) {
        return !ui.showPanel($scope.project.id, panel);
    };

    $scope.showPanel = function (panel) {
        return ui.showPanel($scope.project.id, panel);
    };

    $scope.openPanel = function (panel) {
        ui.togglePanelState($scope.project.id, panel);
    };

    $scope.togglePanel = function (panel) {
        $scope.activePage = navBarState.setActiveState(panel);
    };

    function init() {
        $scope.mcuser = User.attr();
        $scope.list = sideboard.get($scope.project.id);
    }

    init();

}
