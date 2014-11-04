Application.Controllers.controller("projectProvenanceOverview",
    ["$scope", "mcapi", "project", "User", "Graph", projectProvenanceOverview]);

function projectProvenanceOverview($scope, mcapi, project, User, Graph) {


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
        console.log($scope.process);
        $scope.graph = Graph.constructGraph($scope.process);
        $scope.constructed_process = $scope.graph;

        //
        //
        //
        //
        //var nodes = [], count = 1, edges = [];
        //console.log($scope.process);
        //$scope.process.network_data = {};
        //$scope.process.network_options = {};
        //nodes.push({
        //    id: 0,
        //    label: String($scope.createName($scope.process.name)),
        //    shape: 'dot',
        //    color: {
        //        background: '#FF7F6E',
        //        border: "#666"
        //    }
        //});
        //nodes[0]['level'] = 2;
        //angular.forEach($scope.process.inputs, function (values, key) {
        //    if (key === 'files') {
        //        if (values.length !== 0) {
        //            values.forEach(function (file) {
        //                nodes.push({
        //                    id: count,
        //                    label: String($scope.createName(file.other.name)),
        //                    title: file.other.name,
        //                    shape: 'triangle',
        //                    color: {
        //                        background: '#109618',
        //                        border: "#666"
        //                    }
        //
        //                });
        //                edges.push({
        //                    from: count,
        //                    to: 0
        //                });
        //                nodes[count]['level'] = 1;
        //                count++;
        //                //check for adjacent processes of this file
        //                angular.forEach($scope.process.input_processes, function (process, key) {
        //                    if (process.related_files.indexOf(file.other.name) > -1) {
        //                        nodes.push({
        //                            id: count,
        //                            label: String($scope.createName(process.process_name)),
        //                            title: process.process_name,
        //                            shape: 'dot',
        //                            color: {
        //                                background: '#FF7F6E',
        //                                border: "#666"
        //                            }
        //
        //                        });
        //                        edges.push({
        //                            from: count,
        //                            to: count - 1
        //                        });
        //                        nodes[count]['level'] = 0;
        //                        count++;
        //                    }
        //                });
        //
        //            });
        //        }
        //    } else {
        //        if (key === 'sample') {
        //            var remember_sample_count = '';
        //            nodes.push({
        //                id: count,
        //                label: String($scope.createName(values[0].other.name)),
        //                title: values[0].other.name,
        //                shape: 'triangle',
        //                color: {
        //                    background: '#109618',
        //                    border: "#666"
        //                }
        //            });
        //
        //            edges.push({
        //                from: count,
        //                to: 0
        //            });
        //            nodes[count]['level'] = 1;
        //            remember_sample_count = count;
        //            var linked_sample_to_process = 0;
        //            count++;
        //            angular.forEach($scope.process.output_processes, function (process, key) {
        //                if (process.related_files.indexOf(values[0].other.name) > -1) {
        //                    linked_sample_to_process++;
        //                    nodes.push({
        //                        id: count,
        //                        label: String($scope.createName(process.process_name)),
        //                        title: process.process_name,
        //                        shape: 'dot',
        //                        color: {
        //                            background: '#FF7F6E',
        //                            border: "#666"
        //                        }
        //                    });
        //                    if (linked_sample_to_process !== 0) {
        //                        edges.push({
        //                            from: remember_sample_count,
        //                            to: count
        //                        });
        //                    } else {
        //                        edges.push({
        //                            from: count,
        //                            to: count - 1
        //                        });
        //                    }
        //                    nodes[count]['level'] = 0;
        //                    count++;
        //                }
        //            });
        //
        //        } else {
        //            nodes.push({
        //                id: count,
        //                label: String($scope.createName(key)),
        //                title: key,
        //                shape: 'triangle',
        //                color: {
        //                    background: '#109618',
        //                    border: "#666"
        //                }
        //            });
        //
        //            edges.push({
        //                from: count,
        //                to: 0
        //            });
        //            nodes[count]['level'] = 1;
        //            count++;
        //        }
        //
        //    }
        //});
        //angular.forEach($scope.process.outputs, function (values, key) {
        //    if (key === 'files' && values.length !== 0) {
        //        var remember_file_count = '';
        //        values.forEach(function (file) {
        //            nodes.push({
        //                id: count,
        //                label: String($scope.createName(file.other.name)),
        //                title: file.other.name,
        //                shape: 'triangle',
        //                color: {
        //                    background: '#109618',
        //                    border: "#666"
        //                }
        //            });
        //            edges.push({
        //                from: 0,
        //                to: count
        //            });
        //            nodes[count]['level'] = 3;
        //            remember_file_count = count;
        //            var linked_file_to_process = 0;
        //            count++;
        //            angular.forEach($scope.process.input_processes, function (process, key) {
        //                if (process.related_files.indexOf(file.other.name) > -1) {
        //                    linked_file_to_process++;
        //                    nodes.push({
        //                        id: count,
        //                        label: String($scope.createName(process.process_name)),
        //                        title: process.process_name,
        //                        shape: 'dot',
        //                        color: {
        //                            background: '#FF7F6E',
        //                            border: "#666"
        //                        }
        //                    });
        //                    if (linked_file_to_process !== 0) {
        //                        edges.push({
        //                            from: remember_file_count,
        //                            to: count
        //                        });
        //                    } else {
        //                        edges.push({
        //                            from: count - 1,
        //                            to: count
        //                        });
        //                    }
        //                    nodes[count]['level'] = 4;
        //                    count++;
        //                }
        //            });
        //        });
        //    } else {
        //        if (key === 'sample') {
        //            var remember_sample_count = '';
        //            nodes.push({
        //                id: count,
        //                label: String($scope.createName(values[0].other.name)),
        //                title: values[0].other.name,
        //                shape: 'triangle',
        //                color: {
        //                    background: '#109618',
        //                    border: "#666"
        //                }
        //            });
        //            edges.push({
        //                from: 0,
        //                to: count
        //            });
        //            nodes[count]['level'] = 2;
        //            count++;
        //
        //        } else {
        //            nodes.push({
        //                id: count,
        //                label: String($scope.createName(key)),
        //                title: key,
        //                shape: 'triangle',
        //                color: {
        //                    background: '#109618',
        //                    border: "#666"
        //                }
        //            });
        //            edges.push({
        //                from: 0,
        //                to: count
        //            });
        //            nodes[count]['level'] = 2;
        //            count++;
        //        }
        //
        //    }
        //
        //});
        //$scope.process.network_data = {
        //    nodes: nodes,
        //    edges: edges
        //};
        //$scope.process.network_options = {
        //    hierarchicalLayout: {
        //        direction: "LR"
        //    },
        //    edges: {style: "arrow"},
        //    smoothCurves: false
        //
        //};
    };

    $scope.apikey = User.apikey();
    $scope.project = project;
    $scope.processes = project.processes;
    if ($scope.processes.length !== 0) {

        //Draw graph: with all connecting processes ( input and output )
        $scope.processes.forEach(function (process) {

        });
        $scope.openProcess(0);
    }
    $scope.showInputsOutputs = true;

}
