Application.Controllers.controller("projectProvenanceOverview",
                                   ["$scope", "project", "User", "Graph", "$stateParams", "Restangular", projectProvenanceOverview]);

function projectProvenanceOverview($scope, project, User, Graph, $stateParams, Restangular) {

    $scope.sideboardSearch = {
        name: ""
    };

    $scope.openClose = function (process) {
        process.showDetails = !process.showDetails;
        if (process.showDetails) {
            // On open construct the graph
            $scope.constructed_process = {};
            $scope.flag = false;
            $scope.sample = {};
            $scope.settings = [];
            $scope.process = process;
            $scope.process.network_data = {};
            $scope.process.network_options = {};
            $scope.graph = Graph.constructGraph($scope.process);
            $scope.constructed_process = $scope.graph;
            $scope.inputsample = '';
        }

    };

    $scope.expandSample = function(id){
        var i = _.indexOf($scope.project.samples, function(item){
            return item.id === id;
        });
        $scope.inputsample = $scope.project.samples[i];
    };

    $scope.apikey = User.apikey();
    $scope.project = project;
    $scope.processes = project.processes;
    $scope.processes.forEach(function(process) {
        process.showDetails = false;
    });

    if ($scope.processes.length !== 0) {
        if ($stateParams.index) {
            $scope.openClose($scope.processes[$stateParams.index]);
        } else {
            $scope.openClose($scope.processes[0]);
        }
    }
}
