class MCProcessTemplateCreateSamplesComponentController {
    /*@ngInject*/
    constructor(focus, $mdDialog, samplesAPI, $stateParams, toast, selectItems, experimentsAPI, navbarOnChange, mcprojstore) {
        this.focus = focus;
        this.$mdDialog = $mdDialog;
        this.samplesAPI = samplesAPI;
        this.projectId = $stateParams.project_id;
        this.experimentId = $stateParams.experiment_id;
        this.toast = toast;
        this.selectItems = selectItems;
        this.experimentsAPI = experimentsAPI;
        this.navbarOnChange = navbarOnChange;
        this.mcprojstore = mcprojstore;
    }

    selectFiles() {
        this.selectItems.fileTree(true).then(
            (selected) => {
                let files = selected.files.map(f => { return {id: f.id, command: 'add'}; });
                let filesArgs = {
                    template_id: this.process.template_id,
                    files: files,
                    process_id: this.process.id
                };
                this.experimentsAPI.updateProcess(this.projectId, this.experimentId, this.process.id, filesArgs)
                    .then(
                        () => {
                            this.process.files = this.process.files.concat(selected.files);
                            this.mcprojstore.updateCurrentProcess((currentProcess) => {
                                currentProcess.files = this.process.files;
                                return currentProcess;
                            });
                        },
                        () => this.toast.error('Unable to add files')
                    );
            });
    }

    addSample() {
        let lastItem = this.process.output_samples.length - 1;
        // If there is no name for the last entry then do not add a new entry.
        if (lastItem !== -1 && this.process.output_samples[lastItem].name === '') {
            return;
        }

        this.samplesAPI.createSamplesInProjectForProcess(this.projectId, this.process.id, [{name: ''}])
            .then(
                (samples) => {
                    let sampleIds = samples.samples.map((s) => s.id);
                    this.navbarOnChange.fireChange();
                    this.samplesAPI.addSamplesToExperiment(this.projectId, this.experimentId, sampleIds)
                        .then(
                            () => {
                                this.process.output_samples.push(samples.samples[0]);
                                this.focus(samples.samples[0].id);
                            },
                            () => this.toast.error('Failed to add sample to experiment')
                        );
                },
                () => this.toast.error('Failed to add new sample')
            );
    }

    remove(index) {
        let sample = this.process.output_samples[index];
        this.samplesAPI.deleteSamplesFromExperiment(this.projectId, this.experimentId, this.process.id, [sample.id])
            .then(
                () => this.process.output_samples.splice(index, 1),
                () => this.toast.error('Unable to remove sample')
            );
    }

    updateSampleName(sample) {
        this.samplesAPI.updateSampleInExperiment(this.projectId, this.experimentId, this.process.id, {
                id: sample.id,
                name: sample.name
            })
            .then(
                () => null,
                () => this.toast.error('Unable to update sample name')
            );
    }

    addMultipleSamples() {
        this.$mdDialog.show({
            templateUrl: 'app/global.components/process/add-multiple-samples-dialog.html',
            controller: AddMultipleSamplesDialogController,
            controllerAs: '$ctrl',
            bindToController: true,
            locals: {
                projectId: this.projectId,
                experimentId: this.experimentId,
                processId: this.process.id
            }
        }).then(
            (samples) => this.process.output_samples = this.process.output_samples.concat(samples)
        )
    }
}

angular.module('materialscommons').component('mcProcessTemplateCreateSamples', {
    templateUrl: 'app/global.components/process/mc-process-template-create-samples.html',
    controller: MCProcessTemplateCreateSamplesComponentController,
    bindings: {
        process: '=',
        onChange: '&'
    }
});

class AddMultipleSamplesDialogController {
    /*@ngInject*/
    constructor($mdDialog, samplesAPI, toast) {
        this.$mdDialog = $mdDialog;
        this.samplesAPI = samplesAPI;
        this.toast = toast;
        this.nameTemplate = "";
        this.count = 2;
    }

    done() {
        if (this.nameTemplate.indexOf('$INDEX') === -1) {
            this.toast.error(`Template name doesn't contain $INDEX`);
            return;
        }

        let samplesToAdd = [];
        for (let i = 0; i < this.count; i++) {
            let name = this.nameTemplate.replace("$INDEX", "" + (i + 1));
            samplesToAdd.push({name: name});
        }

        this.samplesAPI.createSamplesInProjectForProcess(this.projectId, this.processId, samplesToAdd)
            .then(
                (samples) => {
                    let sampleIds = samples.samples.map((s) => s.id);
                    this.samplesAPI.addSamplesToExperiment(this.projectId, this.experimentId, sampleIds)
                        .then(
                            () => this.$mdDialog.hide(samples.samples),
                            () => this.toast.error('Failed to add samples to experiment')
                        );
                },
                () => this.toast.error('Failed to add new samples')
            );
    }

    cancel() {
        this.$mdDialog.cancel();
    }
}
