Application.Directives.directive('homeProvenance', homeProvenanceDirective);
function homeProvenanceDirective() {
    return {
        restrict: "EA",
        controller: 'homeProvenanceDirectiveController',
        scope: {
            project: '=project'
        },
        templateUrl: 'application/core/projects/project/home/directives/home-provenance.html'
    };
}

Application.Controllers.controller("homeProvenanceDirectiveController",
    ["$scope", "projectState", "$state",
        homeProvenanceDirectiveController]);
function homeProvenanceDirectiveController($scope, projectState, $state) {
    $scope.createName = function (name) {
        if (name.length > 25) {
            return name.substring(0, 25) + "...";
        }
        return name;
    };

    $scope.addProvenance = function () {
        var stateID = projectState.add($scope.project.id);
        $state.go("projects.project.provenance.create", {sid: stateID});
    };
    $scope.graph = [];
    console.log($scope.project.processes);
    $scope.project.processes.forEach(function (process) {
        var construct = {}
        var nodes = [];
        var edges = [];
        nodes.push({
            id: 0,
            label: String(process.name),
            title: process.name
        })
        nodes[0]['level'] = 1;
        var count = 1;
        angular.forEach(process.inputs, function (values, key) {
            if (key === 'files' && values.length !== 0) {
                values.forEach(function (file) {
                    nodes.push({
                        id: count,
                        label: String($scope.createName(file.other.name)),
                        title: file.other.name,
                        shape: 'dot',
                        color: {
                            background: '#FF7F6E',
                            border: "#666"
                        }

                    });
                    edges.push({
                        from: count,
                        to: 0
                    });
                    nodes[count]['level'] = 0;
                    count++;
                });
            } else {
                if (key === 'sample') {
                    nodes.push({
                        id: count,
                        label: String($scope.createName(values[0].other.name)),
                        title: values[0].other.name,
                        shape: 'square',
                        color: {
                            background: '#2B7CE9',
                            border: "#666"
                        }
                    });
                } else {
                    nodes.push({
                        id: count,
                        label: String($scope.createName(key)),
                        title: key,
                        shape: 'triangle',
                        color: {
                            background: '#109618',
                            border: "#666"
                        }
                    });
                }

                edges.push({
                    from: count,
                    to: 0
                });
                nodes[count]['level'] = 0;
                count++;
            }
        });

        angular.forEach(process.outputs, function (values, key) {
            if (key === 'files' && values.length !== 0) {
                values.forEach(function (file) {
                    nodes.push({
                        id: count,
                        label: String($scope.createName(file.other.name)),
                        title: file.other.name,
                        shape: 'dot' ,
                        color: {
                            background: '#FF7F6E',
                            border: "#666"
                        }
                    });
                    edges.push({
                        from: 0,
                        to: count
                    });
                    nodes[count]['level'] = 2;
                    count++;
                });
            } else {
                if (key === 'sample') {
                    nodes.push({
                        id: count,
                        label: String($scope.createName(values[0].other.name)),
                        title: values[0].other.name,
                        shape: 'square',
                        color: {
                            background: '#2B7CE9',
                            border: "#666"
                        }
                    });
                } else {
                    nodes.push({
                        id: count,
                        label: String($scope.createName(key)),
                        title: key,
                        shape: 'triangle',
                        color: {
                            background: '#109618',
                            border: "#666"
                        }
                    });
                }
                edges.push({
                    from: 0,
                    to: count
                });
                nodes[count]['level'] = 2;
                count++;
            }

        });
        construct.network_data = {
            nodes: nodes,
            edges: edges
        }
        construct.network_options = {
            hierarchicalLayout: {
                direction: "LR"
            },
            edges: {style: "arrow"},
            smoothCurves: false

        };
        $scope.graph.push(construct);
    });

}
