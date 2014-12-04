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
    var id = $scope.project.id;

    //console.log(projectFiles.model);
    $scope.showFiles = function(mediatype) {
        console.log("show files for: ", mediatype);
        var files = [];
        var treeModel = new TreeModel();
        console.dir(projectFiles.model.projects[id].dir);
        var root = treeModel.parse(projectFiles.model.projects[id].dir);
        root.walk({strategy: 'pre'}, function(node) {
            console.dir(node);
            if (node.mediatype == mediatype) {
                files.push(node);
            }
        });
        console.dir(files);
    };
}
