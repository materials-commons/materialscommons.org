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
                                   ["$scope", "ui",
                                    homeSamplesController]);

function homeSamplesController($scope, ui, sideboard) {

    $scope.project.samples.forEach(function(sample) {
        if (!('showDetails' in sample)) {
            sample.showDetails = false;
        }
    });

    $scope.toggleExpanded = function() {
        ui.toggleIsExpanded($scope.project.id, "samples");
    };

    $scope.isExpanded = function() {
        return ui.isExpanded($scope.project.id, "samples");
    };
}
