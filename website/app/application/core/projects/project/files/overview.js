Application.Controllers.controller("projectFilesOverview",
                                   ["$scope", "project", "ProjectPath", "User", "ui", "projectFiles", projectFilesOverview]);

function projectFilesOverview($scope, project, ProjectPath, User, ui, projectFiles) {
    $scope.apikey = User.apikey();
    ui.setShowFiles(project.id, true);
    projectFiles.setActive(project.id, false);

    $scope.expand = function (df) {
        $scope.datafile = df;
    };

    $scope.getImages = function () {
        $scope.datafiles = ProjectPath.get_dir();
    };
}
