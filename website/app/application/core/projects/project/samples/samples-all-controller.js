(function (module) {
    module.controller("SamplesAllController", SamplesAllController);
    SamplesAllController.$inject = ["$scope", "$state", "project", "$filter"];
    function SamplesAllController($scope, $state, project, $filter) {
        $scope.project = project;
        if (project.samples.length !== 0) {
            var sortedSamples = $filter('orderBy')(project.samples, 'name');
            $scope.current = sortedSamples[0];
            $state.go('projects.project.samples.all.edit', {sample_id: $scope.current.id});
        }

        $scope.viewSample = function (sample) {
            $scope.current = sample;
            $state.go('projects.project.samples.all.edit', {sample_id: $scope.current.id});
        };
    }
}(angular.module('materialscommons')));