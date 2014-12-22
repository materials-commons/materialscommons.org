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
                                   ["$scope", "ui",
                                    homeNotesDirectiveController]);

function homeNotesDirectiveController($scope, ui) {
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

    $scope.toggleExpanded = function() {
        ui.toggleIsExpanded($scope.project.id, "notes");
    };

    $scope.isExpanded = function() {
        return ui.isExpanded($scope.project.id, "notes");
    };
}
