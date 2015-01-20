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
    $scope.project.notes.forEach(function(note) {
        if (!('showDetails' in note)) {
            note.showDetails = false;
        }
    });

    $scope.toggleExpanded = function() {
        ui.toggleIsExpanded($scope.project.id, "notes");
    };

    $scope.isExpanded = function() {
        return ui.isExpanded($scope.project.id, "notes");
    };

    $scope.createNote = function(){
        $scope.model.createNote = true;
    };

    $scope.splitScreen = function(what, col){
        ui.toggleColumns(what, col, $scope.project.id);
    };

    $scope.isSplitExpanded = function () {
        return ui.getSplitStatus($scope.project.id);
    };

    $scope.model = {
        createNote: false
    };
}
