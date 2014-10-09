Application.Controllers.controller('projectsProject',
                                   ["$scope", "$stateParams", "actionStatus", "provStep",
                                    "model.projects", "projectColors", "ui", projectsProject]);

function projectsProject ($scope, $stateParams, actionStatus, provStep, projects,
                          projectColors, ui) {
    $scope.isActive = function (tab) {
        return tab === $scope.activeTab;
    };

    actionStatus.addProject($stateParams.id);
    provStep.addProject($stateParams.id);

    projects.get($stateParams.id).then(function(project) {
        $scope.project = project;
        projectColors.setCurrentProjectByID($stateParams.id);
    });

    $scope.showTabs = function() {
        return ui.showToolbarTabs($stateParams.id);
    };

    $scope.showFiles = function() {
        return ui.showFiles($stateParams.id);
    };
}
