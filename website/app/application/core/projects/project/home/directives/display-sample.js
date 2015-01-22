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
    ["$scope", "sideboard", "current", "pubsub", "toggleDragButton",
        displaySampleDirectiveController]);

function displaySampleDirectiveController($scope, sideboard, current, pubsub, toggleDragButton) {
    $scope.addToSideboard = function (sample, event) {
        sideboard.handleFromEvent(current.projectID(), sample, event, 'sideboard');
    };
    $scope.project = current.project();

    $scope.bk = {
        addToReview: false,
        addToProvenance: false,
        addToNote: false
    };

    $scope.isActive = function(type, button){
        return toggleDragButton.get(type, button);
    };

    $scope.addItem = function (type) {
        $scope.sample.show = true;
        switch (type) {
            case "review":
                pubsub.send('addSampleToReview', $scope.sample);
                break;
            case "note":
                pubsub.send('addSampleToNote', $scope.sample);
                break;
            case "provenance":
                pubsub.send('addSampleToProvenance', $scope.sample);
                break;
        }
    };
}
