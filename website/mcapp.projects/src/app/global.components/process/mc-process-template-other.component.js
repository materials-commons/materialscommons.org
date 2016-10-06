class MCProcessTemplateOtherComponentController {
    /*@ngInject*/
    constructor(sampleLinker, processEdit, selectItems, experimentsService, toast, $stateParams, navbarOnChange) {
        this.sampleLinker = sampleLinker;
        this.processEdit = processEdit;
        this.selectItems = selectItems;
        this.experimentsService = experimentsService;
        this.toast = toast;
        this.projectId = $stateParams.project_id;
        this.experimentId = $stateParams.experiment_id;
        this.navbarOnChange = navbarOnChange;
    }

    $onInit() {
        //console.log('process = ', this.process.plain());
    }

    linkFilesToSample(sample, input_files, output_files) {
        this.sampleLinker.linkFilesToSample(sample, input_files, output_files).then(function(linkedFiles) {
            sample = this.processEdit.refreshSample(linkedFiles, sample);
        });
    }

    selectFiles() {
        this.selectItems.open('files').then(
            (selected) => {
                let files = selected.files.map(f => { return {id: f.id, command: 'add'}; });
                let filesArgs = {
                    template_id: this.process.template_id,
                    files: files,
                    process_id: this.process.id
                };
                this.experimentsService.updateProcess(this.projectId, this.experimentId, this.process.id, filesArgs)
                    .then(
                        () => this.process.input_files = selected.files,
                        () => this.toast.error('Unable to add files')
                    );
            });
    }

    selectSamples() {
        this.selectItems.open('samples').then(
            (selected) => {
                let samples = selected.samples.map(s => {
                    for (let i = 0; i < s.versions.length; i++) {
                        if (s.versions[i].selected) {
                            return {
                                id: s.id,
                                property_set_id: s.versions[i].property_set_id,
                                command: 'add'
                            };
                        }
                    }
                });
                let samplesArgs = {
                    template_id: this.process.template_id,
                    samples: samples,
                    process_id: this.process.id
                };

                this.experimentsService.updateProcess(this.projectId, this.experimentId, this.process.id, samplesArgs)
                    .then(
                        () => {
                            this.process.input_samples = selected.samples;
                            this.navbarOnChange.fireChange();
                            if (this.onChange) {
                                this.onChange();
                            }
                        },
                        () => this.toast.error('Unable to add samples')
                    );
            }
        );
    }
}

angular.module('materialscommons').component('mcProcessTemplateOther', {
    templateUrl: 'app/global.components/process/mc-process-template-other.html',
    controller: MCProcessTemplateOtherComponentController,
    bindings: {
        process: '<',
        onChange: '&'
    }
});
