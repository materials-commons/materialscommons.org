(function(module) {
    module.component('mcFiles', {
        templateUrl: 'components/files/mc-files.html',
        controller: 'MCFilesComponentController',
        bindings: {
            files: '='
        }
    });

    module.controller('MCFilesComponentController', MCFilesComponentController);
    MCFilesComponentController.$inject = ["mcfile"];
    function MCFilesComponentController(mcfile) {
        var ctrl = this;
        ctrl.selected = [];

        ctrl.fileSrc = mcfile.src;
        ctrl.isImage = isImage;
    }
}(angular.module('materialscommons')));
