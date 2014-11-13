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
                                   ["$scope", "$state",
                                    homeNotesDirectiveController]);
function homeNotesDirectiveController($scope, $state) {

    $scope.addNote = function() {
        $state.go("projects.project.notes.create");
    };

    $scope.editNote = function(index) {
        $state.go("projects.project.notes.edit",{index: index});
    };
    console.log($scope.project);

}
