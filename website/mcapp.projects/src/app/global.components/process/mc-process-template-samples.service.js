class MCProcessTemplateSamplesService {
    /*@ngInject*/
    constructor(navbarOnChange, samplesService, toast, $mdDialog) {
        this.navbarOnChange = navbarOnChange;
        this.samplesService = samplesService;
        this.toast = toast;
        this.$mdDialog = $mdDialog;
    }

    addSample(projectId, experimentId, processId) {
        this.samplesService.createSamplesInProjectForProcess(projectId, processId, [{name: ''}])
            .then(
                (samples) => {
                    this.navbarOnChange.fireChange();
                    return samples;
                },
            )
            .then(
                samples => {
                    let sampleIds = samples.samples.map((s) => s.id);
                    return this.samplesService.addSamplesToExperiment(projectId, experimentId, sampleIds)
                        .then(
                            () => samples
                        );
                }
            );
    }

    remove(index) {
        let sample = this.process.output_samples[index];
        this.samplesService.deleteSamplesFromExperiment(this.projectId, this.experimentId, this.process.id, [sample.id])
            .then(
                () => this.process.output_samples.splice(index, 1),
                () => this.toast.error('Unable to remove sample')
            );
    }

    updateSampleName(sample) {
        this.samplesService.updateSampleInExperiment(this.projectId, this.experimentId, this.process.id, {
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

angular.module('materialscommons').service('mcProcessTemplateSamples', MCProcessTemplateSamplesService);