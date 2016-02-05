(function (module) {


    module.directive("displayFileUploadEntry", displayFileUploadEntryDirective);
    function displayFileUploadEntryDirective() {
        return {
            restrict: "E",
            replace: true,
            scope: {
                file: "=file"
            },
            controller: "DisplayFileUploadEntryDirectiveController",
            controllerAs: 'upload',
            bindToController: true,
            templateUrl: "application/directives/display-file-upload-entry.html"
        };
    }

    ///////////////////////////////////////////////
    module.controller("DisplayFileUploadEntryDirectiveController", DisplayFileUploadEntryDirectiveController);

    DisplayFileUploadEntryDirectiveController.$inject = ["mcapi"];

    /* @ngInject */
    function DisplayFileUploadEntryDirectiveController(mcapi) {
        var ctrl = this;
        ctrl.removeFromUpload = removeFromUpload;

        ////////////////////

        function removeFromUpload(file) {
            file.cancel();

            // Only delete on server if the file hasn't been uploaded. If
            // the file has been uploaded then there will be no request
            // that needs to be deleted.
            if (file.isComplete() && !file.error) {
                // already uploaded.
                return;
            }
            mcapi("/upload/%", file.uniqueIdentifier).delete();
        }
    }

}(angular.module('materialscommons')));
