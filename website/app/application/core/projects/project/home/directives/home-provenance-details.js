Application.Directives.directive("homeProvenanceDetails", homeProvenanceDetailsDirective);
function homeProvenanceDetailsDirective() {
    return {
        restrict: "E",
        controller: 'homeProvenanceDetailsDirectiveController',
        scope:true,
        replace: true,
        templateUrl: "application/core/projects/project/home/directives/home-provenance-details.html"
    };
}

Application.Controllers.controller("homeProvenanceDetailsDirectiveController",
    ["$scope", "Graph",
        homeProvenanceDetailsDirectiveController]);
function homeProvenanceDetailsDirectiveController($scope, Graph) {
    if ('name' in $scope.process) {
        $scope.graph = Graph.constructGraph($scope.process);
    } else {
        $scope.graph = '';
    }
}

