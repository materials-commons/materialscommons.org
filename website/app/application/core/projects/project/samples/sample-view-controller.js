Application.Controllers.controller("projectSampleView",
    ["$scope", "model.projects", "$stateParams", "mcapi", projectSampleView]);

function projectSampleView($scope, Projects,$stateParams, mcapi) {

    $scope.refreshProcesses = function () {
        mcapi('/processes/sample/%', $scope.sample.id)
            .success(function (data) {
                $scope.processes_by_sample = data;
            }).jsonp();
    };

    $scope.showTreatmentDetails_and_processes = function (sample) {
        $scope.sample = sample;
//        $scope.refreshProcesses();
    };

    function init(){
        Projects.get($stateParams.id).then(function(project) {
            $scope.project = project;
        });
    }
    init();


}
