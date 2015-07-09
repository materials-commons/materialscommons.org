Application.Controllers.controller('projectEditProcess',
    ["$scope", "project", "$stateParams", "modalInstance", projectEditProcess]);

function projectEditProcess($scope, project, $stateParams,  modalInstance) {

    $scope.openSample = function(sample){
        modalInstance.openModal(sample, 'sample', project);
    };

    $scope.openFile = function(file){
       modalInstance.openModal(file, 'datafile', project);
    };

    function init() {
        $scope.project = project;
        var i = _.indexOf($scope.project.processes, function (process) {
            return process.id === $stateParams.process_id;
        });
        if (i > -1) {
            $scope.current = $scope.project.processes[i];
        }
    }

    init();
}

