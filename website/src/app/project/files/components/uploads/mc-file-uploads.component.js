angular.module('materialscommons').component('mcFileUploads', {
    templateUrl: 'app/project/files/components/uploads/mc-file-uploads.html',
    controller: MCFileUploadsComponentController
});

/*@ngInject*/
function MCFileUploadsComponentController(mcFlow, $timeout) {
    var ctrl = this;

    ctrl.flow = mcFlow.get();
    ctrl.filesByDir = {};
    loadFilesByDir();

    ctrl.flow.on('catchAll', (eventName) => {
        // Force a dirty check of the changed flow state.
        $timeout(() => {
            if (eventName === 'filesAdded' || eventName === 'fileRemoved') {
                loadFilesByDir();
            } else if (eventName === 'complete') {
                ctrl.flow.files.length = 0;
            }
        });
    });

    /////////////////////////

    function loadFilesByDir() {
        var files = ctrl.flow.files;
        ctrl.filesByDir = {}; // reset the list

        // Load files indexed by the directory
        files.forEach((file) => {
            if (!(file.attrs.directory_name in ctrl.filesByDir)) {
                ctrl.filesByDir[file.attrs.directory_name] = [];
            }
            ctrl.filesByDir[file.attrs.directory_name].push(file);
        });
    }
}
