Application.Controllers.controller("projectProvenanceView",
    ["$scope", "mcapi", "$stateParams", "model.projects", "ProcessList", "User", "pubsub", projectProvenanceView]);

function projectProvenanceView($scope, mcapi, $stateParams, Projects, ProcessList, User, pubsub) {

    $scope.openProcess = function (p) {
        $scope.flag = false;
        $scope.sample = {}
        $scope.settings = []
        $scope.process = p;
    }

    $scope.createName = function (name) {
        if (name.length > 12) {
            return name.substring(0, 20) + "...";
        }
        return name;
    };
    $scope.expand = function (df) {
        $scope.flag = false;
        $scope.active = df.id;
        $scope.datafile = df;
    }

    $scope.isActiveList = function (k) {
        if (k == $scope.active) {
            return true
        }
        return false
    }

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

    }

    function init() {
        $scope.apikey = User.apikey();

        Projects.get($stateParams.id).then(function (project) {
            $scope.project = project;
            $scope.processes = ProcessList.getProcesses($stateParams.id);
        });

    }

    init();
}
