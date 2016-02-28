(function (module) {
    module.component('mcProcessCreateOther', {
        templateUrl: 'project/processes/process/create/create-other.html',
        controller: 'MCProcessCreateOtherComponentController'
    });

    module.controller('MCProcessCreateOtherComponentController', MCProcessCreateOtherComponentController);
    MCProcessCreateOtherComponentController.$inject = [
        'template', 'processSelections', 'createProcess', 'toastr', 'previousStateService', '$state', 'sampleLinker'
    ];
    function MCProcessCreateOtherComponentController(template, processSelections, createProcess, toastr,
                                                     previousStateService, $state, sampleLinker) {
        var ctrl = this;
        ctrl.process = template.get();

        ctrl.remove = removeById;
        ctrl.chooseSamples = _.partial(processSelections.selectSamples, ctrl.process.input_samples);
        ctrl.chooseInputFiles = _.partial(processSelections.selectFiles, ctrl.process.input_files);
        ctrl.chooseOutputFiles = _.partial(processSelections.selectFiles, ctrl.process.output_files);

        ctrl.linkFilesToSample = sampleLinker.linkFilesToSample;

        ctrl.submit = submit;
        ctrl.submitAndAnother = submitAndAnother;
        ctrl.cancel = _partial(previousStateService.go, 'process_create_previous');

        previousStateService.setMemo('process_create_previous', 'project.processes.create');

        function submitAndAnother() {
            var go = _.partial($state.go, 'project.processes.create', {
                template_id: ctrl.process.process_name,
                process_id: ''
            });
            performSubmit(go);
        }

        function submit() {
            var go = _partial(previousStateService.go, 'process_create_previous');
            performSubmit(go);
        }

        function performSubmit(goFn) {
            createProcess($stateParams.project_id, ctrl.process)
                .then(
                    function success() {
                        goFn();
                    },

                    function failure() {
                        toastr.error('Unable to create sample', 'Error', {closeButton: true});
                    }
                );
        }
    }
}(angular.module('materialscommons')));
