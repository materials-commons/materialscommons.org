Application.Directives.directive("displayProcess", displayProcessDirective);
function displayProcessDirective() {
    return {
        restrict: "E",
        replace: true,
        scope: {
            process: "=process",
            showSideboard: "=showSideboard"
        },
        controller: "displayProcessDirectiveController",
        templateUrl: "application/core/projects/project/home/directives/display-process.html"
    };
}
Application.Controllers.controller("displayProcessDirectiveController",
                                   ["$scope", "sideboard", "current","pubsub",
                                    displayProcessDirectiveController]);

function displayProcessDirectiveController($scope, sideboard, current, pubsub) {
    $scope.addToSideboard = function(process, event) {
        sideboard.handleFromEvent(current.projectID(), process, event, 'sideboard');
    };
    $scope.remove = function (process, event) {
        sideboard.handleFromEvent(current.projectID(), process, event, 'sideboard');
    };
    $scope.addItem = function (process) {
        pubsub.send('addProcessToReview', process);
    };
    $scope.popUp = function(){

    };
}
