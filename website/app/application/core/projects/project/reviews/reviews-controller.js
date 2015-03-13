Application.Controllers.controller('projectReviews',
    ["$scope", "project", "ui", projectReviews]);

function projectReviews($scope, project, ui) {

    $scope.showPanel = function(what) {
        return ui.showPanel(project.id, what);
    };
    $scope.openPanel = function (panel) {
        ui.togglePanelState(project.id, panel);
    };
    $scope.project = project;

}
