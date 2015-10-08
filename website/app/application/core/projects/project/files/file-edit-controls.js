(function (module) {
    module.directive('fileEditControls', fileEditControlsDirective);
    function fileEditControlsDirective() {
        return {
            restrict: "E",
            scope: {
                file: "="
            },
            controller: 'FileEditControlsDirectiveController',
            controllerAs: 'ctrl',
            bindToController: true,
            templateUrl: 'application/core/projects/project/files/file-edit-controls.html'
        };
    }

    module.controller('FileEditControlsDirectiveController', FileEditControlsDirectiveController);
    FileEditControlsDirectiveController.$inject = ['mcfile', 'pubsub', 'toastr'];

    function FileEditControlsDirectiveController(mcfile, pubsub, toastr) {
        var ctrl = this;

        ctrl.newName = "";
        ctrl.renameActive = false;
        ctrl.renameFile = renameFile;
        ctrl.downloadSrc = downloadSrc;
        ctrl.deleteFile = deleteFile;

        ////////////////////////////////

        function deleteFile() {
            ctrl.file.remove().then(function(f) {
                // do something here with deleting the file.
            }).catch(function(err) {
                toastr.error("File deletion failed: " + err.error, "Error");
            });
        }

        function renameFile() {
            if (ctrl.newName === "") {
                return;
            } else if (ctrl.newName === ctrl.file.name) {
                return;
            }
            ctrl.file.name = ctrl.newName;
            ctrl.file.customPUT({name: ctrl.newName}).then(function (f) {
                ctrl.file.name = f.name;
                ctrl.renameActive = false;
                pubsub.send('files.refresh', ctrl.file);
            }).catch(function (err) {
                toastr.error("File rename failed: " + err.error, "Error");
            });
        }

        function downloadSrc() {
            return mcfile.downloadSrc(ctrl.file.id);
        }

    }
}(angular.module('materialscommons')));

