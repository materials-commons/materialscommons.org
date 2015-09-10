(function (module) {
    module.controller('projectListProcess', projectListProcess);
    projectListProcess.$inject = ["$scope", "project", "$state", "modalInstance"];

    function projectListProcess($scope, project, $state, modalInstance) {
        $scope.project = project;
        if (project.processes.length !== 0) {
            $scope.current = project.processes[0];
            $state.go('projects.project.processes.list.view', {process_id: $scope.current.id});
        }

        $scope.viewProcess = function (process) {
            $scope.current = process;
            $state.go('projects.project.processes.list.view', {process_id: $scope.current.id});
        };

        $scope.chooseTemplate = function () {
            modalInstance.chooseTemplate($scope.project);
        };
    }
}(angular.module('materialscommons')));
