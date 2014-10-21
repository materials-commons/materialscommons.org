Application.Controllers.controller('projectsProject',
                                   ["$scope", "provStep", "ui",
                                    "project", "current", "pubsub", projectsProject]);

function projectsProject ($scope, provStep, ui, project, current, pubsub) {
    $scope.isActive = function (tab) {
        return tab === $scope.activeTab;
    };

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
}
