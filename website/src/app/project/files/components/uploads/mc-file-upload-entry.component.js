angular.module('materialscommons').component('mcFileUploadEntry', {
    template: require('./mc-file-upload-entry.html'),
    controller: MCFileUploadEntryComponentController,
    bindings: {
        file: '='
    }
});

/*@ngInject*/
function MCFileUploadEntryComponentController(mcapi) {
    const ctrl = this;
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
