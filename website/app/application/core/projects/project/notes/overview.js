Application.Controllers.controller("projectNotesOverview",
    ["$scope", "Project", "$state", "project", projectNotesOverview]);

function projectNotesOverview($scope, Project, $state, project) {
    $scope.editNotes = function (index) {
        $state.go('projects.project.notes.edit', {'index': index});
    };
    function init(){
        $scope.project_notes = Project.getNotes(project, 'project');
        $scope.sample_notes = Project.getNotes(project, 'sample');
    }
    init();
}
