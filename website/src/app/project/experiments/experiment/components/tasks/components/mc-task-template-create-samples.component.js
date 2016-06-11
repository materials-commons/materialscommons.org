angular.module('materialscommons').component('mcTaskTemplateCreateSamples', {
    templateUrl: 'app/project/experiments/experiment/components/tasks/components/mc-task-template-create-samples.html',
    controller: MCTaskTemplateCreateSamplesComponentController,
    bindings: {
        task: '='
    }
});

/*@ngInject*/
function MCTaskTemplateCreateSamplesComponentController(prepareCreatedSample) {
    let ctrl = this,
        lastId = 0;

    ctrl.addSample = () => {
        ctrl.task.template.samples.push({
            name: '',
            id: 'sample_' + lastId++
        });
    };

    function prepareSample() {
        prepareCreatedSample.filloutComposition(ctrl.sample, ctrl.composition);
        prepareCreatedSample.setupSampleGroup(ctrl.sample, ctrl.sampleGroup, ctrl.sampleGroupSizing,
            ctrl.sampleGroupSize);
        prepareCreatedSample.addSampleInputFiles(ctrl.sample, ctrl.process.input_files);
    }
}
