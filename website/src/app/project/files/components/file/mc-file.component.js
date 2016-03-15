angular.module('materialscommons').component('mcFile', {
    templateUrl: 'app/project/files/components/file/mc-file.html',
    controller: MCFileComponentController
});

module.controller('MCFileComponentController', MCFileComponentController);
MCFileComponentController.inject = ["projectsService", "$stateParams"];
function MCFileComponentController(projectsService, $stateParams) {
    'ngInject';

    var ctrl = this;
    projectsService.getProjectFile($stateParams.project_id, $stateParams.file_id)
        .then(function(file) {
            ctrl.file = file;
        });
}