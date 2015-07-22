Application.Directives.directive("homeProcessDetails", homeProcessDetailsDirective);
function homeProcessDetailsDirective() {
    return {
        restrict: "E",
        controller: 'homeProcessDetailsDirectiveController',
        scope:true,
        replace: true,
        templateUrl: "home-process-details.html"
    };
}

Application.Controllers.controller("homeProcessDetailsDirectiveController",
    ["$scope", "Graph",
        homeProcessDetailsDirectiveController]);
function homeProcessDetailsDirectiveController($scope, Graph) {
    if ('name' in $scope.process) {
        $scope.graph = Graph.constructGraph($scope.process);
    } else {
        $scope.graph = '';
    }
}
