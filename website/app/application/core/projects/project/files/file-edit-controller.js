(function (module) {
    module.controller("FilesEditController", FilesEditController);

    FilesEditController.$inject = ['file'];

    /* @ngInject */
    function FilesEditController(file) {
        var ctrl = this;
        ctrl.file = file;
    }
}(angular.module('materialscommons')));