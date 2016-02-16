(function (module) {
    module.component('mcSample', {
        templateUrl: 'components/sample/mc-sample.html',
        controller: 'MCSampleComponentController'
    });

    module.controller('MCSampleComponentController', MCSampleComponentController);
    MCSampleComponentController.$inject = ["$stateParams", "projectsService"];
    function MCSampleComponentController($stateParams, projectsService) {
        var ctrl = this;
        projectsService.getProjectSample($stateParams.project_id, $stateParams.sample_id)
            .then(function(sample) {
                ctrl.sample = sample;
            });
    }
}(angular.module('materialscommons')));
