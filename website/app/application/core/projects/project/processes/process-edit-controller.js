Application.Controllers.controller('projectEditProcess',
    ["$scope", "project", "$stateParams", "modalInstance", "$state", projectEditProcess]);

function projectEditProcess($scope, project, $stateParams, modalInstance, $state) {

    $scope.updateProcess = function () {
        $state.go('projects.project.processes.list.view');
    };

    $scope.cancel = function () {
        $state.go('projects.project.processes.list.view');
    };

    $scope.openFile = function (file) {
        modalInstance.openModal(file, 'datafile', project);
    };

    $scope.openSample = function (sample) {
        modalInstance.openModal(sample, 'sample', project);
    };

    function init() {
        $scope.project = project;
        var i = _.indexOf($scope.project.processes, function (process) {
            return process.id === $stateParams.process_id;
        });

        if (i > -1) {
            $scope.template = $scope.project.processes[i];
        }
    }

    init();
}

