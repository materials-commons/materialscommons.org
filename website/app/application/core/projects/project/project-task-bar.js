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

    var panels = [
        "processes",
        "files",
        "samples",
        "reviews",
        "notes",
        "sideboard"
    ];

    function setAllPanels(to, current) {
        panels.forEach(function (panel) {
            if (current != panel) {
                ui.setIsExpanded($scope.project.id, panel, to);
                ui.setPanelState($scope.project.id, panel, to);
            }
        });
    }

    function showAllPanels() {
        panels.forEach(function (panel) {
            //if (panel !== "sideboard") {
                ui.setIsExpanded($scope.project.id, panel, false);
                ui.setPanelState($scope.project.id, panel, true);
                ui.setPanelState($scope.project.id, 'sideboard', false);
                ui.setPanelState($scope.project.id, 'emptyboard', false);

            //}
        });
    }

    $scope.isMinimized = function (panel) {
        return !ui.showPanel($scope.project.id, panel);
    };

    $scope.showPanel = function (panel) {
        return ui.showPanel($scope.project.id, panel);
    };

    $scope.openPanel = function (panel) {
        ui.togglePanelState($scope.project.id, panel);
    };

    $scope.isActive = function (panel) {
        return ui.isExpanded($scope.project.id, panel);
    };

    $scope.toggleExpanded = function (panel) {
        if (panel === 'dashboard') {
            showAllPanels();
        } else {
            setAllPanels(false, panel);
            ui.toggleIsExpanded($scope.project.id, panel);
            if (!ui.showPanel($scope.project.id, panel) && ui.isExpanded($scope.project.id, panel)) {
                ui.setPanelState($scope.project.id, panel, true);
            } else if (!ui.isExpanded($scope.project.id, panel)) {
                showAllPanels();
                if (panel === "sideboard") {
                    ui.setPanelState($scope.project.id, panel, false);
                }
            }
        }

    };


    $scope.openDrafts = function () {
        ui.togglePanelState($scope.project.id, "drafts");
        if (ui.showPanel($scope.project.id, "drafts")) {
            // Activating drafts. Provwizard shares this ui-view
            // so set it to inactive;
            ui.setPanelState($scope.project.id, "provwizard", false);
            $state.go("projects.project.home.drafts");
        } else {
            // Deactivating the wizard
            $state.go("projects.project.home");
        }
    };

    $scope.openProvWizard = function () {
        ui.togglePanelState($scope.project.id, "provwizard");
        if (ui.showPanel($scope.project.id, "provwizard")) {
            // Activating the wizard. Drafts shares this ui-view
            // so set it to inactive.
            ui.setPanelState($scope.project.id, "drafts", false);
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
