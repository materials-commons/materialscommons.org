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
        $scope.processes = project.processes;
        if ($scope.processes.length !== 0) {
            $scope.openProcess(0);
        }
        $scope.showInputsOutputs = true;
    });
    //first approach
    //$scope.nodes = new vis.DataSet();
    //$scope.edges = new vis.DataSet();
    //$scope.network_data = {
    //    nodes: $scope.nodes,
    //    edges: $scope.edges
    //};
    //$scope.network_options = {
    //    hierarchicalLayout: {
    //        direction: "UD"
    //    },
    //    edges: {style: "arrow"},
    //    smoothCurves: false
    //
    //};
    ////
    ////$scope.onNodeSelect = function(properties) {
    ////    var selected = $scope.task_nodes.get(properties.nodes[0]);
    ////    console.log(selected);
    ////};
    //
    //$scope.nodes.add([
    //    {id: 1, label: 'Process 1'},
    //    {id: 2, label: 'Process 2'},
    //    {id: 3, label: 'Process 3'},
    //    {id: 4, label: 'Process 4'},
    //    {id: 5, label: 'Process 5'}]);
    //
    //$scope.edges.add([
    //    {from: 1, to: 2},
    //    {from: 1, to: 3},
    //    {from: 2, to: 4},
    //    {from: 2, to: 5},
    //]);

    //second approach
    //$scope.network_data = {
    //    dot: 'dinetwork {node[shape=box fontSize=18]; process1 -> process1 -> process2; process2 -> process3[label=settings]; 2 -- 4; 2 -> 1 }'
    //};

    //third approach
    var nodes = [];
    var edges = [];
    var connectionCount = [];
    for (var i = 0; i < 5; i++) {
        nodes.push({
            id: i,
            label: String(i)
        });
    }
    edges.push({
        from: 2,
        to: 3
    });
    edges.push({
        from: 2,
        to: 1
    });
    edges.push({
        from: 2,
        to: 0
    });
    edges.push({
        from: 3,
        to: 4
    });


    nodes[0]['level'] = 0;
    nodes[1]["level"] = 0;
    nodes[2]["level"] = 1;
    nodes[3]["level"] = 2;
    nodes[4]["level"] = 3;
    $scope.network_data = {
        nodes: nodes,
        edges: edges
    }
    $scope.network_options = {
        hierarchicalLayout: {
            direction: "LR"
        },
        edges: {style: "arrow"},
        smoothCurves: false

    };
}
