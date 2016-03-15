angular.module('materialscommons').component('mcSample', {
    templateUrl: 'app/project/samples/sample/mc-sample.html',
    controller: MCSampleComponentController
});

function MCSampleComponentController($stateParams, projectsService) {
    'ngInject';

    var ctrl = this;
    projectsService.getProjectSample($stateParams.project_id, $stateParams.sample_id)
        .then(function(sample) {
            ctrl.sample = sample;
        });
}