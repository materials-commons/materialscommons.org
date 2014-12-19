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
                                   ["$scope", "ui", "sideboard",
                                    homeSamplesController]);

function homeSamplesController($scope, ui, sideboard) {
    var showSampleDetails = [];
    for (var i = 0; i < $scope.project.samples.length; i++) {
        showSampleDetails.push(false);
    }

    $scope.toggleDetails = function(index) {
        showSampleDetails[index] = !showSampleDetails[index];
    };

    $scope.showDetails = function(index) {
        return showSampleDetails[index];
    };

    $scope.toggleExpanded = function() {
        ui.toggleIsExpanded($scope.project.id, "samples");
    };

    $scope.isExpanded = function() {
        return ui.isExpanded($scope.project.id, "samples");
    };

    $scope.addToSideboard = function(sample, event) {
        sideboard.handleFromEvent($scope.project.id, sample, event);
    };
}
