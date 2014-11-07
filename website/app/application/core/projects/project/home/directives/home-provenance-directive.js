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
    ["$scope", "projectState", "$state",
        homeProvenanceDirectiveController]);
function homeProvenanceDirectiveController($scope, projectState, $state) {
    $scope.createName = function (name) {
        if (name.length > 25) {
            return name.substring(0, 25) + "...";
        }
        return name;
    };

    $scope.addProvenance = function () {
        var stateID = projectState.add($scope.project.id);
        $state.go("projects.project.provenance.create", {sid: stateID});
    };

}
