Application.Controllers.controller("projectProvenance",
                                   ["$scope", "project", "projectState", "$state",
                                    projectProvenance]);

function projectProvenance($scope, project, projectState, $state) {
    $scope.projectID = project.id;

    $scope.createProvenance = function() {
        var state = null;
        var stateID = projectState.add(project.id, state);
        $state.go("projects.project.provenance.create", {sid: stateID});
    };
}
