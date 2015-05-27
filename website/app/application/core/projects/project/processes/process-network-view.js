Application.Directives.directive("processNetworkView", [processNetworkViewDirective]);
function processNetworkViewDirective() {
    return {
        restrict: "E",
        replace: true,
        scope: {
            network: "=network",
            templates: "=templates"
        },
        controller: "processNetworkViewDirectiveController",
        templateUrl: "application/core/projects/project/processes/process-network-view.html"
    };
}

Application.Controllers.controller("processNetworkViewDirectiveController",
                                   ["$scope", "$timeout", "$state", "pubsub",
                                    processNetworkViewDirectiveController]);

function processNetworkViewDirectiveController($scope, $timeout, $state, pubsub) {
    var height = window.innerHeight || document.body.clientHeight;
    var heightToSet = height -180;

    $scope.options = {
        stabilize: true,
        height: heightToSet+"px",
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


    $scope.selectedNode = null;
    $scope.selectedEdge = null;

    $scope.onSelect = function(props) {
        if (props.nodes.length !== 0 ) {
            var nodeID = props.nodes[0];
            var index = _.indexOf($scope.data.nodes, function(node) {
                return node.id+"" === nodeID;
            });
            $timeout(function() {
                $scope.selectedNode = $scope.data.nodes[index];
                $scope.selectedEdge = null;
            });
            $state.go("projects.project.new-wizard.node-details");
        } else {
            $timeout(function() {
                $scope.selectedEdge = props.edges[0];
                $scope.selectedNode = null;
            });
            $state.go("projects.project.new-wizard.edge-details");
        }
    };

    $scope.addProcess = function() {
        $state.go("projects.project.new-wizard.templates");
        // if ($scope.selectedNode) {
        //     addFromNode();
        // } else if ($scope.selectedEdge) {
        //     addBetween();
        // }
    };

    var template = null;

    pubsub.waitOn($scope, "new-wizard.template.selected", function(templateID) {
        var index = _.indexOf(templates, function(template) {
            return template.id == templateID;
        });
        if (index !== -1) {
            template = templates[index];
            if ($scope.selectedNode) {
                addFromNode();
            } else if ($scope.selectedEdge) {
                addBetween();
            }
        }
    });

    function addFromNode() {
        if (!$scope.selectedNode) {
            return;
        }

        var node = $scope.selectedNode;
        lastNodeID++;
        $timeout(function() {
            $scope.data.nodes.push({
                id: lastNodeID,
                label: template.name,
                level: node.level+1,
                group: "process"
            });
            $scope.data.edges.push({
                from: node.id,
                to: lastNodeID
            });
            $scope.selectedNode = null;
        });
    }

    function addBetween() {
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
                label: template.name,
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
            $scope.selectedEdge = null;
        });
    }

    $scope.focusOnNode = function() {
        if (!$scope.selectedNode) {
            return;
        }

        // console.dir($scope.selectedNode);

        var nodeID = $scope.selectedNode.id;
        var nodeLevel = $scope.selectedNode.level;


        var al = convertToAdjacencyList($scope.data.edges);

        //console.dir(al);

        //console.dir(dfs($scope.selectedNode.id, al, $scope.selectedNode.level));

        if (true) {
            return;
        }

        $timeout(function() {
            savedNodes = $scope.data.nodes;
            $scope.data.nodes = newNodes;
        });
    };

    // function isConnected(nodeToCheck, baseNode) {
    //     if (nodeToCheck.level == baseNode.level + 1) {
    //         // if no edge directly connects then return false
    //         var connected = false;
    //         $scope.data.edges.forEach(function(edge) {
    //             if (nodeToCheck.id == edge.to && edge.from == baseNode.id) {
    //                 connected = true;
    //             }
    //         });
    //         return connected;
    //     }
    //     return true;
    // }

    $scope.removeFocusOnNode = function() {
        $timeout(function() {
            $scope.data.nodes = savedNodes;
        });
    };

    function convertToAdjacencyList(edgeList) {
        var adjList = {},
            i, len, pari, to, from;
        for (i = 0, len = edgeList.length; i < len; i++) {
            to = edgeList[i].to;
            from = edgeList[i].from;
            if (adjList[to]) {
                adjList[to].push(from);
            } else {
                adjList[to] = [from];
            }
            if (adjList[from]) {
                adjList[from].push(to);
            } else {
                adjList[from] = [to];
            }
        }
        return adjList;
    }

    function bfs(vertex, adjList, visited) {
        var q = [],
            current_group = [],
            i, len, adjV, nextVertex;
        q.push(vertex);
        visited[vertex] = true;
        while (q.length > 0) {
            vertex = q.shift();
            current_group.push(vertex);
            // Go through the adjacency list of vertex and push
            // any unvisited vertex onto the queue.
            adjV = adjList[vertex];
            for (i = 0, len = adjV.length; i < len; i++) {
                nextVertex = adjV[i];
                if (!visited[nextVertex]) {
                    q.push(nextVertex);
                    visited[nextVertex] = true;
                }
            }
        }
        return current_group;
    }

    function dfs(vertex, adjList, level) {
        var stack = [];
        var iterations = 0;
        var current_group = [];
        var visited = {};
        stack.push(vertex);
        while (stack.length > 0) {
            iterations++;
            vertex = stack.shift();
            current_group.push(vertex);
            //console.log("vertex", vertex);
            //console.log("stack %O", stack);
            if (iterations > 10) {
                break;
            }
            if (!visited[vertex]) {
                visited[vertex] = true;
                var adjacent = adjList[vertex];
                adjacent.forEach(function(vertexID) {
                    if (!visited[vertexID]) {
                        if (!isHigher(vertexID, level)) {
                            stack.push(vertexID);
                        }
                    }
                });
            }
        }
        return current_group;
    }

    function isHigher(nodeID, level) {
        var isHigherLevel = false;
        $scope.data.nodes.forEach(function(node) {
            if (node.id == nodeID) {
                if (node.level <= level) {
                    isHigherLevel = true;
                }
            }
        });
        return isHigherLevel;
    }
}
