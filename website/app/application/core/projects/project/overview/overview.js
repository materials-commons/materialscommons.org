Application.Controllers.controller('projectOverview', ["$scope", "$stateParams", "model.projects", "projectColors","$state", projectOverview]);

function projectOverview($scope, $stateParams, projects, projectColors, $state) {
    $scope.setActiveLink = function(tabID) {
        $scope.activeLink = tabID;
    };

    $scope.isActiveLink = function (tabID) {
        if (tabID == $scope.activeLink){
            return true
        }
        return false
    };

    $scope.view = function(id, route){
        $scope.setActiveLink(id);
        $state.go(route);
    }
    $scope.projectColor = projectColors.getCurrentProjectColor();
    projects.get($stateParams.id).then(function(project) {
        $scope.project = project;
        $scope.view('Details', 'projects.project.overview.view')

    });
}
