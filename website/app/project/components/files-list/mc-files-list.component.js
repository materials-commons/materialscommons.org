(function(module) {
    module.component('mcFilesList', {
        templateUrl: 'app/project/components/files-list/mc-files-list.html',
        controller: 'MCFilesListComponentController',
        bindings: {
            files: '='
        }
    });

    module.controller('MCFilesListComponentController', MCFilesListComponentController);
    MCFilesListComponentController.$inject = ["mcfile"];
    function MCFilesListComponentController(mcfile) {
        var ctrl = this;
        ctrl.selected = [];

        ctrl.fileSrc = mcfile.src;
        ctrl.isImage = isImage;
    }
}(angular.module('materialscommons')));
