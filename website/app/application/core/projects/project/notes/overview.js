Application.Controllers.controller("projectNotesOverview",
    ["$scope", "Project", "$state", "project", projectNotesOverview]);

function projectNotesOverview($scope, Project, $state, project) {
    $scope.editNotes = function (index) {
        $state.go('projects.project.notes.edit', {'index': index});
    };

    $scope.updateNotes = function(){
        switch ($scope.bk.category) {
            case "project":
               $scope.notes = Project.getNotes(project, 'project');
                return $scope.notes;
            case "sample":
                $scope.notes = Project.getNotes(project, 'sample');
                return $scope.notes;
            case "datafile":
                return  '';
            default:
                $scope.notes = Project.getNotes(project);
        }
    };

    function init() {
        $scope.bk = {
            category: "all"
        };
        $scope.updateNotes();
    }

    init();
}
