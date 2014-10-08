Application.Controllers.controller("projectProvenanceView",
    ["$scope", "mcapi", "$stateParams", "model.projects", "ProcessList", projectProvenanceView]);

function projectProvenanceView($scope, mcapi, $stateParams, Projects, ProcessList){

    $scope.getProcessDetails = function(){
        ProcessList.getProcesses($stateParams.id);
    }

    function init(){
        console.log('inside provenance view controller');
        Projects.get($stateParams.id).then(function(project)
        {
            $scope.project = project;
            $scope.getProcessDetails();
        });

    }
    init();
}
