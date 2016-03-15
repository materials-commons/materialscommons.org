export function ImageController(mcfile, file, $modalInstance) {
    'ngInject';
    var ctrl = this;

    ctrl.file = file;
    ctrl.fileSrc = mcfile.src(ctrl.file.id);
    ctrl.cancel = cancel;

    /////////////////////////
    function cancel() {
        $modalInstance.dismiss('cancel');
    }
}

