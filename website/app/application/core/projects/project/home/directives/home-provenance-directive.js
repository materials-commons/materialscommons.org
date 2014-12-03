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

}
