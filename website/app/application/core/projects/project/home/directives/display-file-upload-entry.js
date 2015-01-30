Application.Directives.directive("displayFileUploadEntry", displayFileUploadEntryDirective);
function displayFileUploadEntryDirective() {
    return {
        restrict: "E",
        replace: true,
        scope: {
            file: "=file"
        },
        controller: "displayFileUploadEntryDirectiveController",
        templateUrl: "application/core/projects/project/home/directives/display-file-upload-entry.html"
    };
}
Application.Controllers.controller("displayFileUploadEntryDirectiveController",
                                   ["$scope", "mcapi",
                                    displayFileUploadEntryDirectiveController]);

function displayFileUploadEntryDirectiveController($scope, mcapi) {
    $scope.removeFromUpload = function(file) {
        mcapi("/upload/%", file.uniqueIdentifier).delete();
        file.cancel();
    };
}
