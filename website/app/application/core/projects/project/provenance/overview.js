Application.Controllers.controller("projectProvenanceOverview",
    ["$scope", "project", "User", "Graph", "$stateParams", "Restangular", projectProvenanceOverview]);

function projectProvenanceOverview($scope, project, User, Graph, $stateParams, Restangular) {


    $scope.isActive = function (index) {
        return activeIndex === index;
    };

    var activeIndex = 0;

    $scope.openProcess = function (index) {
        $scope.constructed_process = {};
        $scope.flag = false;
        $scope.sample = {};
        $scope.settings = [];
        $scope.process = $scope.processes[index];
        $scope.process.network_data = {};
        $scope.process.network_options = {};
        activeIndex = index;
        $scope.graph = Graph.constructGraph($scope.process);
        $scope.constructed_process = $scope.graph;
        $scope.inputsample = '';
    };

    $scope.expandSample = function(id){
        var i = _.indexOf($scope.project.samples, function(item){
            return item.id === id;
        });
        $scope.inputsample = $scope.project.samples[i];
    }

    $scope.apikey = User.apikey();
    $scope.project = project;
    $scope.processes = project.processes;
    if ($scope.processes.length !== 0) {
        if ($stateParams.index) {
            $scope.openProcess($stateParams.index);
        } else {
            $scope.openProcess(0);
        }
    }
}
