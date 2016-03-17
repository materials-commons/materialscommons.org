import { isImage } from '../../../util/util';

angular.module('materialscommons').component('mcFilesList', {
    templateUrl: 'app/project/components/files-list/mc-files-list.html',
    controller: MCFilesListComponentController,
    bindings: {
        files: '='
    }
});

function MCFilesListComponentController(mcfile) {
    'ngInject';

    var ctrl = this;
    ctrl.selected = [];

    ctrl.fileSrc = mcfile.src;
    ctrl.isImage = isImage;
}