Application.Controllers.controller("projectNotesOverview",
    ["$scope", "project", "User", "$stateParams", "$state", projectNotesOverview]);

function projectNotesOverview($scope, project, User, $stateParams, $state) {

    $scope.editNotes = function (index) {
        $state.go('projects.project.notes.edit', {'index': index});
    };
}
