class MCTaskTemplateOtherComponentController {
    /*@ngInject*/
    constructor(sampleLinker, processEdit, selectItems, experimentsAPI, toast, $stateParams, navbarOnChange) {
        this.sampleLinker = sampleLinker;
        this.processEdit = processEdit;
        this.selectItems = selectItems;
        this.experimentsAPI = experimentsAPI;
        this.toast = toast;
        this.projectId = $stateParams.project_id;
        this.experimentId = $stateParams.experiment_id;
        this.navbarOnChange = navbarOnChange;
    }

    $onInit() {
        // log('task = ', this.task);
    }

    linkFilesToSample(sample, input_files, output_files) {
        this.sampleLinker.linkFilesToSample(sample, input_files, output_files).then(function(linkedFiles) {
            sample = this.processEdit.refreshSample(linkedFiles, sample);
        });
    }

    selectFiles() {
        this.selectItems.fileTree().then(
            (selected) => {
                let files = selected.files.map(f => { return {id: f.id, command: 'add'}; });
                let filesArgs = {
                    template_id: this.task.template.template_id,
                    files: files,
                    process_id: this.task.process_id
                };
                this.experimentsAPI.updateTaskTemplateFiles(this.projectId, this.experimentId, this.task.id, filesArgs)
                    .then(
                        () => this.task.template.input_files = selected.files,
                        () => this.toast.error('Unable to add files')
                    );
            });
    }

    selectSamples() {
        this.selectItems.samples([]).then(
            (selected) => {
                let samples = selected.samples.map(s => {
                    return {
                        id: s.id,
                        property_set_id: s.property_set_id,
                        command: 'add'
                    };
                });
                let samplesArgs = {
                    template_id: this.task.template.template_id,
                    samples: samples,
                    process_id: this.task.process_id
                };

                this.experimentsAPI.updateTaskTemplateSamples(this.projectId, this.experimentId, this.task.id, samplesArgs)
                    .then(
                        () => {
                            this.task.template.input_samples = selected.samples;
                            this.navbarOnChange.fireChange();
                        },
                        () => this.toast.error('Unable to add samples')
                    );
            }
        );
    }
}

angular.module('materialscommons').component('mcTaskTemplateOther', {
    template: require('./mc-task-template-other.html'),
    controller: MCTaskTemplateOtherComponentController,
    bindings: {
        task: '<'
    }
});

