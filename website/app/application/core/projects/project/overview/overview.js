Application.Controllers.controller('projectOverview', ["$scope", "$stateParams", "model.projects", projectOverview]);

function projectOverview($scope, $stateParams, projects) {
    projects.get($stateParams.id).then(function(project) {
        $scope.project = project;
    });
}
