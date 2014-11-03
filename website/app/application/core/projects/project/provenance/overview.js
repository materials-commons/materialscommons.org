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

        //Draw graph: with all connecting processes ( input and output )
        $scope.construct = {};
        var nodes = [], count = 1, edges = [];
        nodes.push({
            id: 0,
            label: String($scope.createName($scope.process.name))
        });
        nodes[0]['level'] = 1;
        angular.forEach($scope.process.input_processes, function (values, key) {
            nodes.push({
                id: count,
                label: String(count) ,
                shape: 'dot'
            });
            edges.push({
                from: count,
                to: 0
            });
            nodes[count]['level'] = 0;
            count++;
        });
        angular.forEach($scope.process.output_processes, function (values, key) {
            nodes.push({
                id: count,
                label: String(count),
                shape: 'dot'
            });
            edges.push({
                from: 0,
                to: count
            });
            nodes[count]['level'] = 2;
            count++;
        });
        $scope.construct.network_data = {
            nodes: nodes,
            edges: edges
        };
        $scope.construct.network_options = {
            hierarchicalLayout: {
                direction: "LR"
            },
            edges: {style: "arrow"},
            smoothCurves: false
        };

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
        if (k === $scope.active) {
            return true;
        }
        return false;
    };

    $scope.showDetails = function (key, values) {
        $scope.flag = true;
        $scope.active = key;
        if (key === 'sample') {
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
        $scope.processes = project.processes;
        if ($scope.processes.length !== 0) {
            $scope.openProcess(0);
        }
        $scope.showInputsOutputs = true;
    });

}
