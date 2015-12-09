(function (module) {
    module.controller('ImageController', ImageController);
    ImageController.$inject = ['mcfile' , 'file',  '$modalInstance'];

    function ImageController(mcfile, file, $modalInstance) {
        var ctrl = this;

        ctrl.file = file;
        ctrl.fileSrc = mcfile.src(ctrl.file.id);
        ctrl.cancel = cancel;

        /////////////////////////
        function cancel() {
            $modalInstance.dismiss('cancel');
        }
    }
}(angular.module('materialscommons')));
