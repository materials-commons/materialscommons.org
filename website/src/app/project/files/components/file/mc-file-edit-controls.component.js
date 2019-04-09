angular.module('materialscommons').component('mcFileEditControls', {
    template: require('./mc-file-edit-controls.html'),
    controller: MCFileEditControlsComponentController,
    bindings: {
        file: '='
    }
});

function MCFileEditControlsComponentController(mcfile, toast) {
    'ngInject';

    const ctrl = this;

    ctrl.newName = ctrl.file.name;
    ctrl.renameActive = false;
    ctrl.renameFile = renameFile;
    ctrl.downloadSrc = downloadSrc;

    ////////////////////////////////

    function renameFile() {
        if (ctrl.newName === '') {
            return;
        } else if (ctrl.newName === ctrl.file.name) {
            ctrl.renameActive = false;
            return;
        }
        ctrl.file.name = ctrl.newName;
        ctrl.file.customPUT({name: ctrl.newName}).then(function(f) {
            ctrl.file.name = f.name;
            ctrl.renameActive = false;
        }).catch(function(err) {
            toast.error('File rename failed: ' + err.error);
        });
    }

    function downloadSrc() {
        return mcfile.downloadSrc(ctrl.file.id);
    }
}
