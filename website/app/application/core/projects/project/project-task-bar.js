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
                                    "User", "sideboard", "projectState",
                                    projectTaskBarDirectiveController]);
function projectTaskBarDirectiveController($scope, current, $state, ui, User, sideboard, projectState) {
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

    $scope.openDrafts = function() {
        ui.togglePanelState("drafts", $scope.project.id);
        if (ui.showPanel('drafts', $scope.project.id)) {
            // Activating drafts. Provwizard shares this ui-view
            // so set it to inactive;
            ui.setPanelState("provwizard", $scope.project.id, false);
            $state.go("projects.project.home.drafts");
        } else {
            // Deactivating the wizard
            $state.go("projects.project.home");
        }
    };

    $scope.openProvWizard = function() {
        ui.togglePanelState('provwizard', $scope.project.id);
        if (ui.showPanel('provwizard', $scope.project.id)) {
            // Activating the wizard. Drafts shares this ui-view
            // so set it to inactive.
            ui.setPanelState("drafts", $scope.project.id, false);
            var state = null;
            var stateID = projectState.add($scope.project.id, state);
            $state.go("projects.project.home.provenance", {sid: stateID});
        } else {
            // Deactivating the wizard
            $state.go("projects.project.home");
        }
    };

    $scope.mcuser = User.attr();
    $scope.list = sideboard.get($scope.project.id);
}
