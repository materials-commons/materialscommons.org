Application.Controllers.controller('projectsProject',
                                   ["$scope", "actionStatus", "provStep", "ui",
                                    "project", projectsProject]);

function projectsProject ($scope, actionStatus, provStep, ui, project) {
    $scope.isActive = function (tab) {
        return tab === $scope.activeTab;
    };

    actionStatus.addProject(project.id);
    provStep.addProject(project.id);
    $scope.project = project;

    $scope.showTabs = function() {
        return ui.showToolbarTabs(project.id);
    };

    $scope.showFiles = function() {
        return ui.showFiles(project.id);
    };
}
