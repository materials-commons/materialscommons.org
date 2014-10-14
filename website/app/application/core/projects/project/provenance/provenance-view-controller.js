Application.Controllers.controller("projectProvenanceView",
    ["$scope", "mcapi", "$stateParams", "model.projects", "ProcessList", projectProvenanceView]);

function projectProvenanceView($scope, mcapi, $stateParams, Projects, ProcessList){

    $scope.getProcessDetails = function(){
        $scope.processes = ProcessList.getProcesses($stateParams.id);
       console.log($scope.processes)
    }
    $scope.createName = function(name) {
        if (name.length > 12) {
            return name.substring(0,10)+"...";
        }
        return name;
    };
    function init(){
        Projects.get($stateParams.id).then(function(project)
        {
            $scope.project = project;
            $scope.getProcessDetails();
        });

    }
    init();
}
