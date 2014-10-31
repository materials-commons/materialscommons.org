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
    $scope.createName = function(name) {
        if (name.length > 5) {
            return name.substring(0,6)+"...";
        }
        return name;
    };

    $scope.addProvenance = function () {
        var stateID = projectState.add($scope.project.id);
        $state.go("projects.project.provenance.create", {sid: stateID});
    };
    $scope.process = $scope.project.processes[0];

    var nodes = [];
    var edges = [];
    nodes.push({
        id: 0,
        label: String($scope.process.name)
    })
    nodes[0]['level'] = 1;

    var count = 1;
    angular.forEach($scope.process.inputs, function (values, key) {
        if( key === 'files' && values.length !==0){
            values.forEach(function(file){
                nodes.push({
                    id: count,
                    label: String($scope.createName(file.other.name))
                });
                edges.push({
                    from: count,
                    to: 0
                });
                nodes[count]['level'] = 0;
                count ++;
            });
        } else{
            nodes.push({
                id: count,
                label: String($scope.createName(key))
            });
            edges.push({
                from: count,
                to: 0
            });
            nodes[count]['level'] = 0;
            count ++;
        }

    });

    angular.forEach($scope.process.outputs, function (values, key) {
        if( key === 'files' && values.length !==0){
            values.forEach(function(file){
                nodes.push({
                    id: count,
                    label: String($scope.createName(file.other.name))
                });
                edges.push({
                    from: 0,
                    to: count
                });
                nodes[count]['level'] = 2;
                count ++;
            });
        } else{
            nodes.push({
                id: count,
                label: String($scope.createName(key))
            });
            edges.push({
                from: 0,
                to: count
            });
            nodes[count]['level'] = 2;
            count ++;
        }

    });
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
