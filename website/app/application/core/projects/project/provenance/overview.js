Application.Controllers.controller("projectProvenanceOverview",
    ["$scope", "mcapi", "project", "User", projectProvenanceOverview]);

function projectProvenanceOverview($scope, mcapi, project, User) {


    $scope.isActive = function (index) {
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
        var nodes = [], count = 1, edges = [];
        $scope.process.network_data = {},
            $scope.process.network_options = {},
            nodes.push({
                id: 0,
                label: String($scope.createName($scope.process.name)) ,
                shape: 'dot'
            });
        nodes[0]['level'] = 1;
        angular.forEach($scope.process.output_processes, function (values, key) {
            nodes.push({
                id: count,
                label: String($scope.createName(values.process_name)),
                shape: 'dot',
                title: values.related_files
            });
            edges.push({
                from: count,
                to: 0
            });
            nodes[count]['level'] = 0;
            count++;
        });
        angular.forEach($scope.process.input_processes, function (values, key) {
            nodes.push({
                id: count,
                label: String($scope.createName(values.process_name)),
                shape: 'dot',
                title: values.related_files

            });
            edges.push({
                from: 0,
                to: count
            });
            nodes[count]['level'] = 2;
            count++;
        });
        $scope.process.network_data= {
            nodes: nodes,
            edges: edges
        };
        $scope.process.network_options = {
            hierarchicalLayout: {
                direction: "LR"
            },
            edges: {style: "arrow"},
            smoothCurves: false
        };
        $scope.constructed_process = $scope.process;
    };

    $scope.apikey = User.apikey();
    $scope.project = project;
    $scope.processes = project.processes;
    if ($scope.processes.length !== 0) {

        //Draw graph: with all connecting processes ( input and output )
        $scope.processes.forEach(function(process){

        });
        $scope.openProcess(0);
    }
    $scope.showInputsOutputs = true;

}
