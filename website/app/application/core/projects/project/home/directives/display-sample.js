Application.Directives.directive("displaySample", displaySampleDirective);
function displaySampleDirective() {
    return {
        restrict: "E",
        replace: true,
        scope: {
            sample: "=sample"
        },
        controller: "displaySampleDirectiveController",
        templateUrl: "application/core/projects/project/home/directives/display-sample.html"
    };
}
Application.Controllers.controller("displaySampleDirectiveController",
    ["$scope", "sideboard", "current", "pubsub", "toggleDragButton",
        displaySampleDirectiveController]);

function displaySampleDirectiveController($scope, sideboard, current, pubsub, toggleDragButton) {

    $scope.project = current.project();
}
