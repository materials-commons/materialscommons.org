Application.Controllers.controller("projectSamples",
    ["$scope", "$state", "project", projectSamples]);
function projectSamples($scope, $state, project) {

    $state.go('projects.project.samples.edit');

    if(project.samples.length !== 0){
        $scope.current = project.samples[0];
        $state.go('projects.project.samples.edit', {sample_id : $scope.current.id});
    }

    $scope.viewSample = function (sample) {
        $scope.current = sample;
        $state.go('projects.project.samples.edit', {sample_id : $scope.current.id});
    };
}
