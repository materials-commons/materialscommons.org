(function (module) {
    module.component('mcFile', {
        templateUrl: 'components/file-tree/file/mc-file.html',
        controller: 'MCFileComponentController'
    });

    module.controller('MCFileComponentController', MCFileComponentController);
    MCFileComponentController.inject = ["projectsService", "$stateParams"];
    function MCFileComponentController(projectsService, $stateParams) {
        var ctrl = this;
        ctrl.file = {};
        projectsService.getProjectFile($stateParams.project_id, $stateParams.file_id)
            .then(function(file) {
                ctrl.file = file;
            });
    }
}(angular.module('materialscommons')));
