(function (module) {
    module.controller("FileEditController", FileEditController);

    FileEditController.$inject = ['file'];

    /* @ngInject */
    function FileEditController(file) {
        var ctrl = this;
        ctrl.file = file;
    }
}(angular.module('materialscommons')));