Application.Services.factory("Graph", [graphService]);
function graphService() {
    var graph = {
        nodes: [],
        edges: [],
        network_data: {},
        network_options: {},
        count: 1,
        item_count: '',
        times_linked_item_to_process: '',

        constructGraph: function (process) {
            graph.nodes = [];
            graph.edges = [];
            graph.count = 1;
            graph.item_count = '';
            graph.times_linked_item_to_process = '';
            //Set up initial node (your main process)
            graph.nodes.push({
                id: 0,
                label: String(graph.createName(process.name)),
                title: process.name,
                shape: 'dot',
                color: {
                    background: '#FF7F6E',
                    border: "#666"
                }
            });
            graph.nodes[0].level = 2;
            //build left side graph
            angular.forEach(process.inputs, function (values, key) {
                if (key === 'files') {
                    if (values.length !== 0) {
                        graph.buildFiles(values, process.downstream, 'upstream');
                    }
                } else if (key === 'sample') {
                    graph.buildSamples(values, process.upstream, 'upstream');
                } else {
                    graph.buildSettings(key);
                }
            });

            angular.forEach(process.outputs, function (values, key) {
                if (key === 'files') {
                    if (values.length !== 0) {
                        graph.buildFiles(values, process.upstream, 'downstream');
                    }
                } else if (key === 'sample') {
                    graph.buildSamples(values, process.downstream, 'downstream');
                } else {
                    graph.buildSettings(key);
                }
            });
            graph.network_data = {
                nodes: graph.nodes,
                edges: graph.edges
            };
            graph.network_options = {
                hierarchicalLayout: {
                    direction: "LR",
                    nodeSpacing: 100,
                    levelSeparation: 150
                },
                edges: {style: "arrow"},
                smoothCurves: false
            };
            return graph;
        },
        createName: function (name) {
            if (name.length > 18) {
                return name.substring(0, 17) + "...";
            }
            return name;
        },
        constructEdge: function (from, to) {
            graph.edges.push({
                from: from,
                to: to
            });
        },
        constructNode: function (name, type) {
            if (type === 'process') {
                graph.nodes.push({
                    id: graph.count,
                    label: String(graph.createName(name)),
                    title: name,
                    shape: 'dot',
                    color: {
                        background: '#FF7F6E',
                        border: "#666"
                    }
                });
            } else {
                graph.nodes.push({
                    id: graph.count,
                    label: String(graph.createName(name)),
                    title: name,
                    shape: 'triangle',
                    color: {
                        background: '#109618',
                        border: "#666"
                    }
                });
            }

        },

        buildFiles: function (files, available_processes, stream) {
            files.forEach(function (file) {
                graph.constructNode(file.other.name, 'file');
                if (stream === 'upstream') {
                    graph.constructEdge(graph.count, 0);
                    graph.nodes[graph.count].level = 1;
                } else {
                    graph.constructEdge(0, graph.count);
                    graph.nodes[graph.count].level = 3;
                }
                graph.count++;
                graph.connectProcesses(available_processes, file.other.name, 'file', stream);
                //check for adjacent processes of this file

            });
        },
        buildSamples: function (samples, available_processes, stream) {
            samples.forEach(function (sample) {
                graph.constructNode(sample.other.name, 'sample');
                if (stream === 'upstream') {
                    graph.constructEdge(graph.count, 0);
                    graph.nodes[graph.count].level = 1;
                } else {
                    graph.constructEdge(0, graph.count);
                    graph.nodes[graph.count].level = 3;
                }
                graph.count++;
                graph.connectProcesses(available_processes, sample.other.name, 'sample',  stream);
            });
        },
        buildSettings: function (key) {
            graph.constructNode(key, 'setting');
            graph.constructEdge(graph.count, 0);
            graph.nodes[graph.count].level = 1;
            graph.count++;
        },

        connectProcesses: function (available_processes, item_name, item_type,  stream) {
            var item = {'item_name': item_name, 'item_type': item_type};
            graph.item_count = graph.count - 1;
            graph.times_linked_item_to_process = 0;
            angular.forEach(available_processes, function (process, key) {
                var i = _.indexOf(process.items, function(p_item) {
                    return item.item_name === p_item.item_name;
                });
                if (i > -1) {
                    graph.times_linked_item_to_process++;
                    graph.constructNode(process.name, 'process');
                    if (graph.times_linked_item_to_process > 0) {
                        if (stream === 'upstream') {
                            graph.constructEdge(graph.count, graph.item_count);
                            graph.nodes[graph.count].level = 0;
                        } else {
                            graph.constructEdge(graph.item_count, graph.count);
                            graph.nodes[graph.count].level = 4;
                        }
                    } else {
                        if (stream === 'upstream') {
                            graph.constructEdge(graph.count, graph.count - 1);
                            graph.nodes[graph.count].level = 0;

                        } else {
                            graph.constructEdge(graph.count - 1, graph.count);
                            graph.nodes[graph.count].level = 4;
                        }
                    }
                    graph.count++;
                }
            });
        }
    };
    return graph;
}