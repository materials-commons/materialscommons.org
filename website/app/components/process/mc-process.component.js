(function (module) {
    module.component('mcProcess', {
        templateUrl: 'components/process/mc-process.html',
        controller: 'MCProcessComponentController'
    });

    module.controller('MCProcessComponentController', MCProcessComponentController);
    MCProcessComponentController.$inject = ["$stateParams", "projectsService"];
    function MCProcessComponentController($stateParams, projectsService) {
        var ctrl = this;
        projectsService.getProjectProcess($stateParams.project_id, $stateParams.process_id)
            .then(function(process) {
                ctrl.process = process;
            });
    }
}(angular.module('materialscommons')));
