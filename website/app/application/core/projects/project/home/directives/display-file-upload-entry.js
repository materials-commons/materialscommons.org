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
        file.cancel();

        // Only delete on server if the file hasn't been uploaded. If
        // the file has been uploaded then there will be no request
        // that needs to be deleted.
        if (file.isComplete() && !file.error) {
            // already uploaded.
            return;
        }
        mcapi("/upload/%", file.uniqueIdentifier).delete();

    };
}
