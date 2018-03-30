class MCTaskTemplateCreateSamplesComponentController {
    /*@ngInject*/
    constructor(prepareCreatedSample, focus, $mdDialog, samplesAPI, $stateParams, toast, selectItems,
                experimentsAPI, navbarOnChange) {
        this.prepareCreatedSample = prepareCreatedSample;
        this.focus = focus;
        this.$mdDialog = $mdDialog;
        this.samplesAPI = samplesAPI;
        this.projectId = $stateParams.project_id;
        this.experimentId = $stateParams.experiment_id;
        this.toast = toast;
        this.selectItems = selectItems;
        this.experimentsAPI = experimentsAPI;
        this.navbarOnChange = navbarOnChange;
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

    addSample() {
        let lastItem = this.task.template.output_samples.length - 1;
        // If there is no name for the last entry then do not add a new entry.
        if (lastItem !== -1 && this.task.template.output_samples[lastItem].name === '') {
            return;
        }

        this.samplesAPI.createSamplesInProjectForProcess(this.projectId, this.task.process_id, [{name: ''}])
            .then(
                (samples) => {
                    let sampleIds = samples.samples.map((s) => s.id);
                    this.navbarOnChange.fireChange();
                    this.samplesAPI.addSamplesToExperiment(this.projectId, this.experimentId, sampleIds)
                        .then(
                            () => {
                                this.task.template.output_samples.push(samples.samples[0]);
                                this.focus(samples.samples[0].id);
                            },
                            () => this.toast.error('Failed to add sample to experiment')
                        );
                },
                () => this.toast.error('Failed to add new sample')
            );
    }

    remove(index) {
        let sample = this.task.template.output_samples[index];
        this.samplesAPI.deleteSamplesFromExperiment(this.projectId, this.experimentId, this.task.process_id, [sample.id])
            .then(
                () => this.task.template.output_samples.splice(index, 1),
                () => this.toast.error('Unable to delete remove sample')
            );
    }

    updateSampleName(sample) {
        this.samplesAPI.updateSampleInExperiment(this.projectId, this.experimentId, this.task.process_id, {
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
            templateUrl: 'app/project/experiments/experiment/components/tasks/components/add-multiple-samples-dialog.html',
            controller: AddMultipleSamplesDialogController,
            controllerAs: '$ctrl',
            bindToController: true,
            locals: {
                projectId: this.projectId,
                experimentId: this.experimentId,
                processId: this.task.process_id
            }
        }).then(
            (samples) => this.task.template.output_samples = this.task.template.output_samples.concat(samples)
        )
    }
}

angular.module('materialscommons').component('mcTaskTemplateCreateSamples', {
    template: require('./mc-task-template-create-samples.html'),
    controller: MCTaskTemplateCreateSamplesComponentController,
    bindings: {
        task: '='
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
        if (this.nameTemplate.indexOf('$INDEX') == -1) {
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
