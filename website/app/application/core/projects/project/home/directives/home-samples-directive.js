Application.Directives.directive('homeSamples', homeSamplesDirective);

function homeSamplesDirective() {
    return {
        restrict: "A",
        controller: 'homeSamplesController',
        scope: {
            project: '=project'
        },
        templateUrl: 'application/core/projects/project/home/directives/home-samples.html'
    };
}

Application.Controllers.controller("homeSamplesController",
                                   ["$scope", "pubsub", "Events",
                                    homeSamplesController]);

function homeSamplesController($scope, pubsub, Events) {
    $scope.samples = [];
    $scope.service = Events.getService();
    $scope.samples = $scope.service.samples;
    pubsub.waitOn($scope, "clicked_date", function(date) {
        $scope.clicked_date = date;
        $scope.samples = Events.getEventsByDate($scope.service.grouped_samples, $scope.clicked_date);
    });
}
