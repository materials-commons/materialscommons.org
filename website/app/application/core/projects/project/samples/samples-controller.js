Application.Controllers.controller("projectSamples",
    ["$scope", "$state", projectSamples]);
function projectSamples($scope, $state) {
    $state.go('projects.project.samples.edit');
}
