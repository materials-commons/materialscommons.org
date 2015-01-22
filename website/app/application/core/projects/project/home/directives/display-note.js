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
                                   ["$scope", "sideboard", "current","pubsub", "toggleDragButton",
                                    displayNoteDirectiveController]);

function displayNoteDirectiveController($scope, sideboard, current, pubsub, toggleDragButton) {
    $scope.addToSideboard = function(note, event) {
        sideboard.handleFromEvent(current.projectID(), note, event, 'sideboard');
    };
    $scope.bk = {
        addToReview: false
    };

    $scope.isActive = function(type, button){
        return toggleDragButton.get(type, button);
    };

    $scope.addItem = function (type) {
        $scope.note.show = true;
        switch (type) {
            case "review":
                pubsub.send('addNoteToReview', $scope.note);
                break;
            case "sample":
                pubsub.send('addNoteToSample', $scope.note);
                break;
            case "provenance":
                pubsub.send('addNoteToProvenance', $scope.note);
                break;
            case "file":
                pubsub.send('addNoteToFile', $scope.note);
                break;
        }
    };
}
