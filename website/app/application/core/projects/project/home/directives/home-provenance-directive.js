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
    ["$scope", "projectState", "$state", "User",
        homeProvenanceDirectiveController]);
function homeProvenanceDirectiveController($scope, projectState, $state, User) {

    $scope.createName = function (name) {
        if (name.length > 25) {
            return name.substring(0, 25) + "...";
        }
        return name;
    };
    $scope.displayCount = function (process) {
        return _.keys(process).length;
    };

}
