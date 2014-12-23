Application.Directives.directive("displayNote", displayNoteDirective);
function displayNoteDirective() {
    return {
        restrict: "E",
        replace: true,
        scope: {
            note: "=note",
            showSideboard: "=showSideboard"
        },
        controller: "displayNoteDirectiveController",
        templateUrl: "application/core/projects/project/home/directives/display-note.html"
    };
}
Application.Controllers.controller("displayNoteDirectiveController",
                                   ["$scope", "sideboard", "current",
                                    displayNoteDirectiveController]);

function displayNoteDirectiveController($scope, sideboard, current) {
    $scope.addToSideboard = function(note, event) {
        sideboard.handleFromEvent(current.projectID(), note, event);
    };
}
