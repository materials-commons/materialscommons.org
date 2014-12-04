Application.Directives.directive('homeFiles', homeFilesDirective);
function homeFilesDirective() {
    return {
        restrict: "A",
        controller: 'homeFilesDirectiveController',
        scope: {
            project: '=project'
        },
        templateUrl: 'application/core/projects/project/home/directives/home-files.html'
    };
}

Application.Controllers.controller("homeFilesDirectiveController",
                                   ["$scope",  "projectFiles", homeFilesDirectiveController]);
function homeFilesDirectiveController($scope, projectFiles) {
    //console.dir($scope.project);
    var id = $scope.project.id;
    console.dir(projectFiles.model.projects[id]);
}
