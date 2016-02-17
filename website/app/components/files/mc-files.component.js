(function(module) {
    module.component('mcFiles', {
        templateUrl: 'components/files/mc-files.html',
        controller: 'MCFilesComponentController',
        bindings: {
            files: '='
        }
    });

    module.controller('MCFilesComponentController', MCFilesComponentController);
    MCFilesComponentController.$inject = [];
    function MCFilesComponentController() {
        var ctrl = this;
        ctrl.selected = [];
    }
}(angular.module('materialscommons')));
