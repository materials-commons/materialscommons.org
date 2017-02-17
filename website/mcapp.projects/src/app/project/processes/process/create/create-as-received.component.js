angular.module('materialscommons').component('mcProcessCreateAsReceived', {
    templateUrl: 'app/project/processes/process/create/create-as-received.html',
    controller: MCProcessCreateAsReceivedComponentController,
    bindings: {
        template: '='
    }
});

/*@ngInject*/
function MCProcessCreateAsReceivedComponentController(processSelections, removeById,
                                                      prepareCreatedSample, createProcess,
                                                      toast, previousStateService, $state, $stateParams) {
    var ctrl = this;
    ctrl.process = ctrl.template;
    ctrl.sample = {
        name: '',
        description: '',
        old_properties: [],
        new_properties: [],
        files: []
    };
    ctrl.composition = {value: []};
    ctrl.sampleGroup = false;
    ctrl.sampleGroupSizing = 'set-size';
    ctrl.sampleGroupSize = 10;

    ctrl.chooseSamples = _.partial(processSelections.selectSamples, ctrl.process.input_samples);
    ctrl.chooseInputFiles = _.partial(processSelections.selectFiles, ctrl.process.input_files);
    ctrl.chooseOutputFiles = _.partial(processSelections.selectFiles, ctrl.process.output_files);
    ctrl.remove = removeById;
    ctrl.submit = submit;
    ctrl.submitAndAnother = submitAndAnother;
    //ctrl.cancel = _.partial(previousStateService.go, 'process_create_previous');

    //previousStateService.setMemo('process_create_previous', 'project.processes.create');

    /////////////////

    function submitAndAnother() {
        var go = _.partial($state.go, 'project.processes.create', {
            template_id: ctrl.process.process_name,
            process_id: ''
        });
        performSubmit(go);
    }

    function submit() {
        var go = _.partial(previousStateService.go, 'process_create_previous');
        performSubmit(go);
    }

    function performSubmit(goFn) {
        if (ctrl.sample.name === '') {
            toast.error("You must specify a sample name");
            return;
        }
        prepareSample();
        ctrl.process.output_samples.push(ctrl.sample);
        createProcess($stateParams.project_id, ctrl.process)
            .then(
                function success() {
                    ctrl.composition.value.length = 0;
                    goFn();
                },

                function failure() {
                    toast.error('Unable to create sample');
                }
            );
    }

    function prepareSample() {
        prepareCreatedSample.filloutComposition(ctrl.sample, ctrl.composition);
        prepareCreatedSample.setupSampleGroup(ctrl.sample, ctrl.sampleGroup, ctrl.sampleGroupSizing,
            ctrl.sampleGroupSize);
        prepareCreatedSample.addSampleInputFiles(ctrl.sample, ctrl.process.input_files);
    }
}
