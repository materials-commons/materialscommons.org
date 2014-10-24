Application.Controllers.controller('projectsProject',
                                   ["$scope", "provStep", "ui",
                                    "project", "current", "pubsub", "recent",
                                    projectsProject]);

function projectsProject ($scope, provStep, ui, project, current, pubsub, recent) {
    recent.resetLast(project.id);

    current.setProject(project);
    pubsub.send("sidebar.project");

    provStep.addProject(project.id);
    $scope.project = project;

    $scope.showTabs = function() {
        return ui.showToolbarTabs(project.id);
    };

    $scope.showFiles = function() {
        return ui.showFiles(project.id);
    };

    $scope.isActive = function (tab) {
        return tab === $scope.activeTab;
    };
}
