class MCProcessTemplateSamplesService {
    /*@ngInject*/
    constructor(navbarOnChange, samplesAPI, toast, $mdDialog) {
        this.navbarOnChange = navbarOnChange;
        this.samplesAPI = samplesAPI;
        this.toast = toast;
        this.$mdDialog = $mdDialog;
    }

    addSample(projectId, experimentId, processId) {
        this.samplesAPI.createSamplesInProjectForProcess(projectId, processId, [{name: ''}])
            .then(
                (samples) => {
                    this.navbarOnChange.fireChange();
                    return samples;
                },
            )
            .then(
                samples => {
                    let sampleIds = samples.samples.map((s) => s.id);
                    return this.samplesAPI.addSamplesToExperiment(projectId, experimentId, sampleIds)
                        .then(
                            () => samples
                        );
                }
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
            templateUrl: 'app/modals/add-multiple-samples-dialog.html',
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

angular.module('materialscommons').service('mcProcessTemplateSamples', MCProcessTemplateSamplesService);