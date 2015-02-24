Application.Controllers.controller("provWizardController",
                                   ["$scope", "$timeout", provWizardController]);

function provWizardController($scope, $timeout) {
    $scope.detailsActive = true;
    $scope.templatesActive = false;
    $scope.templates = [
        "template-a",
        "template-b",
        "template-c",
        "template-d"
    ];

    $scope.steps = [
        "Process Description",
        "Settings",
        "Input Files",
        "Output Files"
    ];

    var nodes = [
        {id: 1, label: "My Sample", level: 0, group: "sample"},
        {id: 2, label: "Section", level: 1, group: "process"},
        {id: 3, label: "SEM", level: 1, group: "process"},
        {id: 4, label: "My Sample Cut 1", level: 2, group: "sample"},
        {id: 5, label: "My Sample Cut 2", level: 2, group: "sample"},
        {id: 6, label: "SEM Analysis", level: 2, group: "process"}
    ];

    var lastNodeID = 6;
    var lastEdgeID = 6;

    var edges = [
        {id: 1, from: 1, to: 2},
        {id: 2, from: 1, to: 3},
        {id: 3, from: 2, to: 4},
        {id: 4, from: 2, to: 5},
        {id: 5, from: 3, to: 6},
        {id: 6, from: 2, to: 6}
    ];

    $scope.options = {
        stabilize: true,
        height: '700px',
        //width: '650px',
        dragNetwork: false,
        navigation: true,
        zoomable: true,
        edges: {
            width: 3,
            style: "dash-line"
        },
        hierarchicalLayout: {
            enabled: true,
            nodeSpacing: 500
        },
        groups: {
            sample: {
                color: "gray",
                shape: "box"
            },
            process: {
                shape: "box"
            }
        }
    };

    $scope.data = {
        nodes: nodes,
        edges: edges
    };

    $scope.selectedNode = null;
    $scope.selectedEdge = null;

    $scope.onSelect = function(props) {
        if (props.nodes.length !== 0 ) {
            var nodeID = props.nodes[0];
            var index = _.indexOf($scope.data.nodes, function(node) {
                return node.id+"" === nodeID;
            });
            $scope.selectedNode = $scope.data.nodes[index];
            $scope.selectedEdge = null;
        } else {
            $scope.selectedEdge = props.edges[0];
            $scope.selectedNode = null;
        }
    };

    $scope.addNode = function() {
        if (!$scope.selectedNode) {
            return;
        }

        var node = $scope.selectedNode;
        lastNodeID++;
        $timeout(function() {
            $scope.data.nodes.push({
                id: lastNodeID,
                label: "My new process " + lastNodeID,
                level: node.level+1,
                group: "process"
            });
            $scope.data.edges.push({
                from: node.id,
                to: lastNodeID
            });
        });
    };

    $scope.addBetween = function() {
        if (!$scope.selectedEdge) {
            return;
        }
        var index = _.indexOf($scope.data.edges, function(edge) {
            return edge.id+"" == $scope.selectedEdge;
        });
        var edge = $scope.data.edges[index];
        var indexFrom = _.indexOf($scope.data.nodes, function(node) {
            return node.id == edge.from;
        });
        var fromNode = $scope.data.nodes[indexFrom];

        var indexTo = _.indexOf($scope.data.nodes, function(node) {
            return node.id == edge.to;
        });
        var toNode = $scope.data.nodes[indexTo];
        $timeout(function() {
            lastNodeID++;
            $scope.data.nodes.push({
                id: lastNodeID,
                label: "Inbetween process " + lastNodeID,
                level: fromNode.level+1,
                group: "process"
            });
            toNode.level++;
            $scope.data.edges.splice(index, 1);
            lastEdgeID++;
            $scope.data.edges.push({
                id: lastEdgeID,
                from: fromNode.id,
                to: lastNodeID
            });

            lastEdgeID++;
            $scope.data.edges.push({
                id: lastEdgeID,
                from: lastNodeID,
                to: toNode.id
            });
        });
    };
}
