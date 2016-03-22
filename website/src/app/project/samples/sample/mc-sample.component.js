angular.module('materialscommons').component('mcSample', {
    templateUrl: 'app/project/samples/sample/mc-sample.html',
    controller: MCSampleComponentController,
    bindings: {
        sampleId: '<',
        projectId: '<'
    }
});

/*@ngInject*/
function MCSampleComponentController(projectsService) {
    var ctrl = this;
    ctrl.sample = null;
    console.log('MCSampleComponentController', ctrl.projectId, ctrl.sampleId);
    projectsService.getProjectSample(ctrl.projectId, ctrl.sampleId)
        .then(
            (sample) => ctrl.sample = sample,
            () => console.log('failed to retrieve sample')
        );
}