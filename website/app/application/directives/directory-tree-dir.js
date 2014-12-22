Application.Directives.directive('directoryTreeDir', ["RecursionHelper", directoryTreeDirDirective]);

function directoryTreeDirDirective(RecursionHelper) {
    return {
        restrict: "E",
        scope: {
            file: '=file'
        },
        controller: "directoryTreeDirDirectiveController",
        replace: true,
        templateUrl: 'application/directives/directory-tree-dir.html',
        compile: function(element) {
            return RecursionHelper.compile(element, function(scope, iElement, iAttrs, controller, transcludeFn) {
            });
        }
    };
}

Application.Controllers.controller("directoryTreeDirDirectiveController",
                                   ["$scope", directoryTreeDirDirectiveController]);
function directoryTreeDirDirectiveController($scope) {
    console.log("directoryTreeDirDirectiveController");
    $scope.files = $scope.file.children;
    $scope.files.forEach(function(f) {
        f.showDetails = false;
    });

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
}
