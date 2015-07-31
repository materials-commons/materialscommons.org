Application.Controllers.controller('projectViewProcess',
    ["$scope", "project", "$stateParams", "modalInstance", "$state",projectViewProcess]);

function projectViewProcess($scope, project, $stateParams,  modalInstance, $state) {

    $scope.openSample = function(sample){
        modalInstance.openModal(sample, 'sample', project);
    };

    $scope.openFile = function(file){
       modalInstance.openModal(file, 'datafile', project);
    };

    $scope.editProvenance = function(){
        $state.go('projects.project.processes.list.edit', {process_id: $scope.current.id});
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

