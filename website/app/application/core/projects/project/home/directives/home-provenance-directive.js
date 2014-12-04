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
    ["$scope", "Events", "pubsub",
        homeProvenanceDirectiveController]);
function homeProvenanceDirectiveController($scope, Events, pubsub) {
    $scope.processes = [];
    $scope.service = Events.getService();
    //$scope.processes = $scope.service.processes;
    pubsub.waitOn($scope, "clicked_date", function(date) {
        $scope.clicked_date = date;
        $scope.processes = Events.getEventsByDate($scope.service.grouped_processes, $scope.clicked_date);
    });
}
