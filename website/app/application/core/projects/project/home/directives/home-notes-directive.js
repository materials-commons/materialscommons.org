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
                                   ["$scope","Project",
                                    homeNotesDirectiveController]);
function homeNotesDirectiveController($scope, Project) {

    function init(){
        $scope.sample_notes = Project.getNotes($scope.project, 'sample');
        $scope.project_notes = Project.getNotes($scope.project, 'project');
        $scope.all_notes = Project.getNotes($scope.project);
    }
    init();
}
