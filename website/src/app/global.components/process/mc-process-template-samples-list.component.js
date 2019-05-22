class MCProcessTemplateSamplesListComponentController {
    /*@ngInject*/
    constructor(processesAPI, toast, $stateParams, sampleLinker, samplesAPI, mcbus, showFileService, mcshow) {
        this.processesAPI = processesAPI;
        this.toast = toast;
        this.projectId = $stateParams.project_id;
        this.sampleLinker = sampleLinker;
        this.samplesAPI = samplesAPI;
        this.mcbus = mcbus;
        this.showFileService = showFileService;
        this.mcshow = mcshow;
    }

    removeSample(s) {
        let sampleArg = {
            id: s.id,
            property_set_id: s.property_set_id
        };
        this.processesAPI.updateSamplesInProcess(this.projectId, this.process.id, [], [sampleArg]).then(
            () => this.removeSampleFromProcess(s),
            () => this.toast.error('Unable to remove sample from process')
        );
    }

    linkFilesToSample(sample) {
        this.sampleLinker.linkFilesToSample(sample, this.process.files, []).then(
            (files) => {
                let filesToLink = files.filter(f => f.linked);
                let filesToRemove = files.filter(f => !f.linked);
                this.samplesAPI.updateSampleFiles(this.projectId, sample.id, filesToLink, filesToRemove).then(
                    () => sample.files = _.uniq(filesToLink, 'id'),
                    () => this.toast.error('Unable to link files to sample')
                );
            }
        );
    }

    removeSampleFromProcess(sample) {
        this.removeFromSampleList(sample, 'input_samples');
        this.removeFromSampleList(sample, 'output_samples');
        this.mcbus.send('WORKFLOW$CHANGE', null);
    }

    removeFromSampleList(sample, list) {
        let i = _.findIndex(this.process[list], (s) => s.id === sample.id && s.property_set_id === sample.property_set_id);
        if (i !== -1) {
            this.process[list].splice(i, 1);
        }
    }

    showFile(f) {
        this.showFileService.showFile(f);
    }

    showSample(sample) {
        this.mcshow.sampleDialog(sample);
    }
}

angular.module('materialscommons').component('mcProcessTemplateSamplesList', {
    template: require('./mc-process-template-samples-list.html'),
    controller: MCProcessTemplateSamplesListComponentController,
    bindings: {
        process: '='
    }
});
