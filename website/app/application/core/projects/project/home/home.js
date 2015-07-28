Application.Controllers.controller('projectHome',
    ["$scope", "project", "ui", "mcapi", "$state", projectHome]);

function projectHome($scope, project, ui, mcapi, $state) {

    $scope.showPanel = function(what) {
        return ui.showPanel(project.id, what);
    };

    $scope.openPanel = function (panel) {
        ui.togglePanelState(project.id, panel);
    };

    $scope.project = project;

    $scope.search = function() {
        $state.go('projects.project.home.results', {query: $scope.query}, {reload: true});
    }
}
