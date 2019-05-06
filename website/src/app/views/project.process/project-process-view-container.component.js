class MCProjectProcessViewContainerComponentController {
    /*@ngInject*/
    constructor(projectsAPI, processesAPI, selectItems, $stateParams) {
        this.projectsAPI = projectsAPI;
        this.processesAPI = processesAPI;
        this.selectItems = selectItems;
        this.projectId = $stateParams.project_id;
        this.processId = $stateParams.process_id;
        this.state = {
            process: null,
        };
    }

    $onInit() {
        this.projectsAPI.getProcessForProject(this.projectId, this.processId).then(process => this.state.process = process);
    }

    handleSelectSamples() {
        return this.selectItems.samplesFromProject(this.projectId);
    }

    handleSelectFiles() {
        return this.selectItems.fileTree(true);
    }

    handleCreateSample(sample) {
        return this.processesAPI.addSamplesToProcess(this.projectId, this.processId, null, [sample]).then(
            p => this.state.process = angular.copy(p)
        );
    }

    handleDeleteSample() {
        // API call to delete sample from process
    }

    handleAddSamples(samples, transform) {
        console.log('handleAddSamples', samples, transform);
        samples.forEach(s => s.transform = transform);
        return this.processesAPI.addSamplesToProcess(this.projectId, this.processId, samples).then(
            p => this.state.process = angular.copy(p)
        );
    }

    handleAddFile() {
        // API call to add file to process
    }

    handleDeleteFile() {
        // API call to delete file from process
    }
}

angular.module('materialscommons').component('mcProjectProcessViewContainer', {
    controller: MCProjectProcessViewContainerComponentController,
    template: `<mc-project-process-view process="$ctrl.state.process" 
                                        on-select-samples="$ctrl.handleSelectSamples()"
                                        on-select-files="$ctrl.handleSelectFiles()"
                                        on-add-samples="$ctrl.handleAddSamples(samples, transform)"
                                        on-create-sample="$ctrl.onCreateSample(sample)"
                                        on-delete-sample="$ctrl.onDeleteSample()"
                                        on-add-file="$ctrl.onAddFile()"
                                        on-delete-file="$ctrl.onDeleteFile()"
                                        ng-if="$ctrl.state.process"></mc-project-process-view>`
});