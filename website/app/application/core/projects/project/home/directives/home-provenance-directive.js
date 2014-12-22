Application.Directives.directive('homeProvenance', homeProvenanceDirective);
function homeProvenanceDirective() {
    return {
        restrict: "EA",
        controller: 'homeProvenanceDirectiveController',
        scope: {
            project: '=project'
        },
        templateUrl: 'application/core/projects/project/home/directives/home-provenance.html'
    };
}

Application.Controllers.controller("homeProvenanceDirectiveController",
    ["$scope",
        homeProvenanceDirectiveController]);
function homeProvenanceDirectiveController($scope) {
    var showProvenanceDetails = [];
    for (var i = 0; i < $scope.project.processes.length; i++) {
        showProvenanceDetails.push(false);
    }

    $scope.toggleDetails = function (index, process) {
        showProvenanceDetails[index] = !showProvenanceDetails[index];
    };

    $scope.showDetails = function (index) {
        return showProvenanceDetails[index];
    };
    var combined = [];
    combined.push($scope.project.drafts);
    combined.push($scope.project.processes);
    $scope.project.processes_drafts = _.flatten(combined);
}
