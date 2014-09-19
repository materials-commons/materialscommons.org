Application.Controllers.controller('projectOverview', ["$scope", "$stateParams", "model.projects", "projectColors", projectOverview]);

function projectOverview($scope, $stateParams, projects, projectColors) {
    $scope.projectColor = projectColors.getCurrentProjectColor();
    projects.get($stateParams.id).then(function(project) {
        $scope.project = project;
    });
}
