Application.Directives.directive('directoryTree', directoryTreeDirective);

function directoryTreeDirective() {
    return {
        restrict: "E",
        controller: 'directoryTreeController',
        scope: {
            project: '=project'
        },
        replace: true,
        templateUrl: 'application/directives/directory-tree.html'
    };
}

Application.Controllers.controller("directoryTreeController",
                                   ["$scope", "projectFiles", "User",
                                    directoryTreeController]);

function directoryTreeController($scope, projectFiles, User) {
    $scope.files = projectFiles.model.projects[$scope.project.id].dir.children;
    $scope.files.forEach(function(f) {
        f.showDetails = false;
    });
    //console.dir($scope.files[0]);
    $scope.loaded = true;
    $scope.apikey = User.apikey();

    $scope.toggleDetails = function(file) {
        file.showDetails = !file.showDetails;
    };

    $scope.showDetails = function(file) {
        if (file.type === 'datafile') {
            if (isImage(file.mediatype)) {
                $scope.fileType = "image";
            } else if (file.mediatype === "application/pdf") {
                $scope.fileType = "pdf";
            } else {
                $scope.fileType = file.mediatype;
            }
        }
        return file.showDetails;
    };

    $scope.fileSrc = function(file) {
        var url = "datafiles/static/" + file.id+"?apikey=" + $scope.apikey;
        return url;
    };
}
