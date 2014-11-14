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
                                   ["$scope", "$state","Project",
                                    homeNotesDirectiveController]);
function homeNotesDirectiveController($scope, $state, Project) {
    $scope.addNote = function() {
        $state.go("projects.project.notes.create");
    };

    $scope.editNote = function(index) {
        $state.go("projects.project.notes.edit",{index: index});
    };

    function init(){
        $scope.sample_notes = Project.getNotes($scope.project, 'sample');
        $scope.project_notes = Project.getNotes($scope.project, 'project');
        $scope.all_notes = Project.getNotes($scope.project);
    }
    init();
}
