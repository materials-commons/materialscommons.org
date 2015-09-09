(function (module) {
    module.directive("homeProcessDetails", homeProcessDetailsDirective);
    function homeProcessDetailsDirective() {
        return {
            restrict: "E",
            controller: 'homeProcessDetailsDirectiveController',
            scope: true,
            replace: true,
            templateUrl: "home-process-details.html"
        };
    }

    module.controller("homeProcessDetailsDirectiveController", homeProcessDetailsDirectiveController);
    homeProcessDetailsDirectiveController.$inject = ["$scope", "Graph"];
    function homeProcessDetailsDirectiveController($scope, Graph) {
        if ('name' in $scope.process) {
            $scope.graph = Graph.constructGraph($scope.process);
        } else {
            $scope.graph = '';
        }
    }
}(angular.module('materialscommons')));
