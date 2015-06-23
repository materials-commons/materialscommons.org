Application.Controllers.controller('projectListProcess',
    ["$scope", "project", "$state", "modalInstance", projectListProcess]);

function projectListProcess($scope, project, $state, modalInstance) {
    $scope.project = project;
    $scope.current = project.processes[0];

    $scope.viewProcess = function (process) {
        $scope.current = process;
        $state.go('projects.project.processes.list.edit', {process_id : $scope.current.id});
    };

    $scope.chooseTemplate = function () {
        modalInstance.chooseTemplate(project);
    };

}
