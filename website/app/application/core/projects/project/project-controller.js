Application.Controllers.controller('projectsProject',
                                   ["$scope", "$stateParams", "actionStatus", "provStep", "model.projects", projectsProject]);

function projectsProject ($scope, $stateParams, actionStatus, provStep, projects) {

    $scope.isActive = function (tab) {
        return tab === $scope.activeTab;
    };

    actionStatus.addProject($stateParams.id);
    provStep.addProject($stateParams.id);

    projects.get($stateParams.id).then(function(project) {
        $scope.project = project;
    });
}
