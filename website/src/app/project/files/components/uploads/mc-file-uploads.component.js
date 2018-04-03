class MCFileUploadsComponentController {
    /*@ngInject*/
    constructor(mcFlow, $timeout) {
        this.flow = mcFlow.get();
        this.$timeout = $timeout;
    }

    $onInit() {
        this.filesByDir = {};
        this.loadFilesByDir();

        this.flow.on('catchAll', (eventName) => {
            // Force a dirty check of the changed flow state.
            this.$timeout(() => {
                if (eventName === 'filesAdded' || eventName === 'fileRemoved') {
                    this.loadFilesByDir();
                } else if (eventName === 'complete' && this.resetFiles) {
                    this.flow.files.length = 0;
                }
            });
        });
    }

    loadFilesByDir() {
        const files = this.flow.files;
        this.filesByDir = {}; // reset the list

        // Load files indexed by the directory
        files.forEach((file) => {
            if (!(file.attrs.directory_name in this.filesByDir)) {
                this.filesByDir[file.attrs.directory_name] = [];
            }
            this.filesByDir[file.attrs.directory_name].push(file);
        });
    }
}

angular.module('materialscommons').component('mcFileUploads', {
    template: require('./mc-file-uploads.html'),
    controller: MCFileUploadsComponentController,
    bindings: {
        resetFiles: '<'
    }
});
