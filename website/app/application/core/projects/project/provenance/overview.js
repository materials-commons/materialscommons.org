Application.Controllers.controller("projectProvenanceOverview",
    ["$scope", "project", "User", "Graph", projectProvenanceOverview]);

function projectProvenanceOverview($scope, project, User, Graph) {
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
    };

    $scope.apikey = User.apikey();
    $scope.project = project;
    $scope.processes = project.processes;
    if ($scope.processes.length !== 0) {
        $scope.openProcess(0);
    }
}
