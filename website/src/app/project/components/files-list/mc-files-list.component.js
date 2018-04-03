angular.module('materialscommons').component('mcFilesList', {
    template: require('./mc-files-list.html'),
    controller: MCFilesListComponentController,
    bindings: {
        files: '='
    }
});

function MCFilesListComponentController(mcfile, isImage) {
    'ngInject';

    var ctrl = this;
    ctrl.selected = [];

    ctrl.fileSrc = mcfile.src;
    ctrl.isImage = isImage;
}
