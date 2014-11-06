Application.Controllers.controller("projectFiles",
                                   ["$scope", "project", "projectFileTabs", "recent",
                                    projectFiles]);

function projectFiles($scope, project, projectFileTabs, recent) {
    $scope.projectID = project.id;
    $scope.files = projectFileTabs.get(project.id);

    $scope.closeFile = function(file) {
        projectFileTabs.delete(project.id, file);
        recent.gotoLast(project.id);
    };
}
