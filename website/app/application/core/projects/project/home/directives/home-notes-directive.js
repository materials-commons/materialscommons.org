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
                                   ["$scope", "projectState", "$state",
                                    homeNotesDirectiveController]);
function homeNotesDirectiveController($scope, projectState, $state) {
    $scope.addNote = function() {
        var stateID = projectState.add($scope.project.id);
        $state.go("projects.project.notes.create");
    };
}
