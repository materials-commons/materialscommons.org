angular.module('materialscommons').component('mcSample', {
    templateUrl: 'app/project/samples/sample/mc-sample.html',
    controller: MCSampleComponentController,
    bindings: {
        sampleId: '<',
        projectId: '<'
    }
});

/*@ngInject*/
function MCSampleComponentController(projectsService, toast) {
    var ctrl = this;
    ctrl.sample = null;
    projectsService.getProjectSample(ctrl.projectId, ctrl.sampleId)
        .then(
            (sample) => ctrl.sample = sample,
            () => toast.error('failed to retrieve sample')
        );
}