class MCProjectProcessViewComponentController {
    /*@ngInject*/
    constructor(mcshow, User) {
        this.mcshow = mcshow;
        this.state = {
            process: null,
            isBetaUser: User.isBetaUser(),
        };
    }

    $onChanges(changes) {
        if (changes.process) {
            this.state.process = angular.copy(changes.process.currentValue);
        }
    }

    showJson() {
        this.mcshow.showJson(this.state.process);
    }

    handleSelectSamples() {
        return this.onSelectSamples();
    }

    handleSelectFiles() {
        return this.onSelectFiles();
    }

    handleCreateSample(sample) {
        return this.onCreateSample({sample});
    }

    handleDeleteSample() {
        return this.onDeleteSample();
    }

    handleAddSamples(samples, transform) {
        return this.onAddSamples({samples, transform});
    }

    handleAddFile() {
        return this.onAddFile();
    }

    handleDeleteFile() {
        return this.onDeleteFile();
    }
}

angular.module('materialscommons').component('mcProjectProcessView', {
    controller: MCProjectProcessViewComponentController,
    template: require('./project-process-view.html'),
    bindings: {
        process: '<',
        onSelectSamples: '&',
        onSelectFiles: '&',
        onCreateSample: '&',
        onDeleteSample: '&',
        onAddSamples: '&',
        onAddFile: '&',
        onDeleteFile: '&',
    }
});