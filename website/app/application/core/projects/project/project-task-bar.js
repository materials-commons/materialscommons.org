Application.Directives.directive("projectTaskBar", projectTaskBarDirective);
function projectTaskBarDirective() {
    return {
        restrict: "E",
        replace: true,
        scope: {
            project: "=project",
            projects: "=projects"
        },
        controller: "projectTaskBarDirectiveController",
        templateUrl: "application/core/projects/project/project-task-bar.html"
    };
}

Application.Controllers.controller("projectTaskBarDirectiveController",
                                   ["$scope", "current", "$state", "ui",
                                    "User", "sideboard",
                                    projectTaskBarDirectiveController]);
function projectTaskBarDirectiveController($scope, current, $state, ui, User, sideboard) {
    $scope.setProject = function (project) {
        current.setProject(project);
        $scope.showProjects = false;
        $state.go("projects.project.home", {id: project.id});
    };

    $scope.isMinimized = function(panel) {
        return !ui.showPanel(panel, $scope.project.id);
    };

    $scope.showPanel = function(panel) {
        return ui.showPanel(panel, $scope.project.id);
    };

    $scope.openPanel = function(panel) {
        ui.togglePanelState(panel, $scope.project.id);
    };

    $scope.mcuser = User.attr();
    $scope.list = sideboard.get($scope.project.id);
}
