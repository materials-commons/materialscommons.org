Application.Directives.directive('homeNotes', homeNotesDirective);
function homeNotesDirective() {
    return {
        restrict: "A",
        controller: 'homeNotesDirectiveController',
        scope: {
            project: '=project'
        },
        templateUrl: 'application/core/projects/project/home/directives/home-notes.html'
    };
}

Application.Controllers.controller("homeNotesDirectiveController",
    ["$scope",
        homeNotesDirectiveController]);

function homeNotesDirectiveController($scope) {
    var showNoteDetails = [];
    for (var i = 0; i < $scope.project.notes.length; i++) {
        showNoteDetails.push(false);
    }
    $scope.toggleDetails = function(index) {
        showNoteDetails[index] = !showNoteDetails[index];
    };

    $scope.showDetails = function(index) {
        return showNoteDetails[index];
    };
}

