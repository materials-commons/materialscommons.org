Application.Controllers.controller("projectProvenanceOverview",
                                   ["$scope", "mcapi", "$stateParams", "model.projects", "ProcessList", "User", projectProvenanceOverview]);

function projectProvenanceOverview($scope, mcapi, $stateParams, Projects, ProcessList, User) {
    var activeIndex = 0;
    $scope.openProcess = function (index) {
        $scope.flag = false;
        $scope.sample = {};
        $scope.settings = [];
        $scope.process = $scope.processes[index];
        activeIndex = index;
    };

    $scope.isActive = function(index) {
        return activeIndex === index;
    };

    $scope.createName = function (name) {
        if (name.length > 25) {
            return name.substring(0, 22) + "...";
        }
        return name;
    };

    $scope.expand = function (df) {
        $scope.flag = false;
        $scope.active = df.id;
        $scope.datafile = df;
    };


    $scope.isActiveList = function (k) {
        if (k == $scope.active) {
            return true;
        }
        return false;
    };

    $scope.showDetails = function (key, values) {
        $scope.flag = true;
        $scope.active = key;
        if (key == 'sample') {
            $scope.settings = [];
            mcapi('/objects/%', values[0].value)
                .success(function (data) {
                    $scope.sample = data.sample;
                }).jsonp();
        } else {
            $scope.key = key;
            $scope.settings = values;
        }
    };

    $scope.apikey = User.apikey();
    Projects.get($stateParams.id).then(function (project) {
        $scope.project = project;
        ProcessList.getProcesses($stateParams.id).then(function(processes) {
            $scope.processes = processes;
            if ($scope.processes.length !== 0) {
                $scope.openProcess(0);
            }
        });
        $scope.showInputsOutputs = true;
    });
}
