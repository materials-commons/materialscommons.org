Application.Directives.directive('homeProvenance', homeProvenanceDirective);
function homeProvenanceDirective () {
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
    console.log($scope.project);
    $scope.addProvenance = function() {
        var stateID = projectState.add($scope.project.id);
        $state.go("projects.project.provenance.create", {sid: stateID});
    };
}
