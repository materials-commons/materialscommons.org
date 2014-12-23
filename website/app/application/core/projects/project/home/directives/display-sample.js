Application.Directives.directive("displaySample", displaySampleDirective);
function displaySampleDirective() {
    return {
        restrict: "E",
        replace: true,
        scope: {
            sample: "=sample",
            showSideboard: "=showSideboard"
        },
        controller: "displaySampleDirectiveController",
        templateUrl: "application/core/projects/project/home/directives/display-sample.html"
    };
}
Application.Controllers.controller("displaySampleDirectiveController",
                                   ["$scope", "sideboard", "current",
                                    displaySampleDirectiveController]);

function displaySampleDirectiveController($scope, sideboard, current) {
    $scope.addToSideboard = function(sample, event) {
        sideboard.handleFromEvent(current.projectID(), sample, event);
    };
}
