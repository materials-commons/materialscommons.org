Application.Controllers.controller("projectSamples",
    ["$scope", "$state", projectSamples]);
function projectSamples($scope, $state) {
    $state.go('projects.project.samples.edit');
    $scope.viewSample = function (sample) {
        $scope.current = sample;
        $state.go('projects.project.samples.edit', {sample_id : $scope.current.id});
    };
}
