(function(module) {
    module.component('mcProcessEdit', {
        // Use the create process template
        templateUrl: 'project/processes/process/create/create-other.html',
        controller: 'MCProcessEditComponentController'
    });

    module.controller('MCProcessEditComponentController', MCProcessEditComponentController);
    MCProcessEditComponentController.$inject = [
        'sampleLinker', 'process', 'toastr', 'processSelections', 'projectsService', '$state', '$stateParams'
    ];

    function MCProcessEditComponentController(sampleLinker, process, toastr, processSelections,
                                              projectsService, $state, $stateParams) {
        var ctrl = this;
        ctrl.process = process.get();
        ctrl.process['updated_samples'] = [];
        ctrl.process['updated_input_files'] = [];
        ctrl.process['updated_output_files'] = [];
        ctrl.process['samples_files'] = [];

        ctrl.linkFilesToSample = linkFilesToSample;

        ctrl.chooseSamples = _.partial(processSelections.selectUpdatedSamples,
            ctrl.process.input_samples, ctrl.process.updated_samples);
        ctrl.chooseInputFiles = _.partial(processSelections.selectUpdatedFiles,
            ctrl.process.input_files, ctrl.process.updated_input_files);
        ctrl.chooseOutputFiles = _.partial(processSelections.selectUpdatedFiles,
            ctrl.process.output_files, ctrl.process.updated_output_files);

        ctrl.submit = submit;
        ctrl.cancel = cancel;
        ctrl.remove = remove;

        //////////////////////////////////

        function submit() {
            var updatedProcess = {
                id: ctrl.process.id,
                what: ctrl.process.what,
                name: ctrl.process.name,
                setup: ctrl.process.setup.settings[0].properties.map(function (p) {
                    p = p.property;
                    var prop = {
                        value: p.value,
                        name: p.name,
                        description: p.description,
                        unit: p.unit,
                        setup_id: p.setup_id,
                        _type: p._type,
                        attribute: p.attribute
                    };
                    if (p.id) {
                        prop.id = p.id;
                    }
                    return prop;
                }),
                input_samples: ctrl.process.updated_samples,
                input_files: ctrl.process.updated_input_files,
                output_files: ctrl.process.updated_output_files,
                sample_files: ctrl.process.samples_files
            };

            projectsService.updateProjectProcess($stateParams.project_id, updatedProcess).then(
                function success() {
                    $state.go('project.processes');
                },

                function failure() {
                    toastr.error('Unable to create sample', 'Error', {closeButton: true});
                }
            );
        }

        function cancel() {
            $state.go('project.processes');
        }

        function remove(from, item) {
            var whichUpdatedList = '';
            if (from === ctrl.process.input_samples) {
                console.log('remove from input_samples');
                whichUpdatedList = 'updated_samples;'
            } else if (from === ctrl.process.input_files) {
                console.log('remove from input_files');
                whichUpdatedList = 'updated_input_files';
            } else {
                console.log('remove from output_files');
                whichUpdatedList = 'updated_output_files';
            }

            var index = _.findIndex(ctrl.process[whichUpdatedList], {id: item.id});
            if (index === -1) {
                ctrl.process[whichUpdatedList].push({id: item.id, command: 'delete'});
            } else {
                removeById(ctrl.process[whichUpdatedList], item);
            }
        }

        function linkFilesToSample(sample, input_files, output_files) {
            sampleLinker.linkFilesToSample(sample, input_files, output_files).then(function(linkedFiles) {
                ctrl.process = processEdit.addToSamplesFiles(linkedFiles, ctrl.process);
                sample = processEdit.refreshSample(linkedFiles, sample);
            });
        }
    }
}(angular.module('materialscommons')));