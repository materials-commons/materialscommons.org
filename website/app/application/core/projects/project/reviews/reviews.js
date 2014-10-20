Application.Controllers.controller("projectReviews", ["$scope", "project", "projectState", "$state",
                                                      projectReviews]);

function projectReviews($scope, project, projectState, $state) {
    $scope.projectID = project.id;

    $scope.createReview = function() {
        var state = null;
        var stateID = projectState.add(project.id, state);
        $state.go("projects.project.reviews.create", {sid: stateID});
    };
}
