Application.Directives.directive('directoryTreeFile', directoryTreeFileDirective);

function directoryTreeFileDirective() {
    return {
        restrict: "E",
        scope: {
            file: '=file'
        },
        controller: "directoryTreeFileDirectiveController",
        replace: true,
        templateUrl: 'application/directives/directory-tree-file.html'
    };
}

Application.Controllers.controller("directoryTreeFileDirectiveController",
                                   ["$scope", "User",
                                    directoryTreeFileDirectiveController]);
function directoryTreeFileDirectiveController($scope, User) {
    $scope.apikey = User.apikey();

    $scope.toggleDetails = function(file) {
        file.showDetails = !file.showDetails;
    };

    $scope.showDetails = function(file) {
        if (isImage(file.mediatype)) {
            $scope.fileType = "image";
        } else if (file.mediatype === "application/pdf") {
            $scope.fileType = "pdf";
        } else {
            $scope.fileType = file.mediatype;
        }
        return file.showDetails;
    };

    $scope.fileSrc = function(file) {
        var url = "datafiles/static/" + file.id+"?apikey=" + $scope.apikey;
        return url;
    };

    $scope.showDetails($scope.file);
}
