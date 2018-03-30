angular.module('materialscommons').component('mcProcessCreateOther', {
    template: require('./create-other.html'),
    controller: MCProcessCreateOtherComponentController,
    bindings: {
        template: '='
    }
});

/*@ngInject*/
function MCProcessCreateOtherComponentController(processSelections, createProcess, toast,
                                                 previousStateService, $state, sampleLinker, processEdit,
                                                 $stateParams, removeById) {
    var ctrl = this;
    ctrl.process = ctrl.template;

    ctrl.remove = removeById;
    ctrl.chooseSamples = _.partial(processSelections.selectSamples, ctrl.process.input_samples);
    ctrl.chooseInputFiles = _.partial(processSelections.selectFiles, ctrl.process.input_files);
    ctrl.chooseOutputFiles = _.partial(processSelections.selectFiles, ctrl.process.output_files);

    ctrl.linkFilesToSample = linkFilesToSample;

    ctrl.submit = submit;
    ctrl.submitAndAnother = submitAndAnother;
    //ctrl.cancel = _.partial(previousStateService.go, 'process_create_previous');

   // previousStateService.setMemo('process_create_previous', 'project.processes.create');

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
        createProcess($stateParams.project_id, ctrl.process)
            .then(
                function success() {
                    goFn();
                },

                function failure() {
                    toast.error('Unable to create sample');
                }
            );
    }

    function linkFilesToSample(sample, input_files, output_files) {
        sampleLinker.linkFilesToSample(sample, input_files, output_files).then(function(linkedFiles) {
            sample = processEdit.refreshSample(linkedFiles, sample);
        });
    }
}
