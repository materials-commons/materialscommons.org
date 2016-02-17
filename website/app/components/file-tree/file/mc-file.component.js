(function (module) {
    module.component('mcFile', {
        templateUrl: 'components/file-tree/file/mc-file.html',
        controller: 'MCFileComponentController'
    });

    module.controller('MCFileComponentController', MCFileComponentController);
    MCFileComponentController.inject = [];
    function MCFileComponentController() {

    }
}(angular.module('materialscommons')));
