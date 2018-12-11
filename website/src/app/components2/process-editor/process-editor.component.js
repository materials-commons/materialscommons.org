class MCProcessEditorComponentController {
    /*@ngInject*/
    constructor() {
        this.state = {
            process: null,
        };
    }

    $onChanges(changes) {
        if (changes.process) {
            this.state.process = angular.copy(changes.process.currentValue);
        }
    }

    selectFiles() {
        this.onSelectFiles();
    }

    addSample() {
        this.onAddSample();
    }

    addMultipleSamples() {
        this.onAddMultipleSamples();
    }

    selectSamples() {
        this.onSelectSamples();
    }

    remove() {

    }

    updateSampleName() {

    }
}

angular.module('materialscommons').component('mcProcessEditor', {
    controller: MCProcessEditorComponentController,
    template: require('./process-editor.html'),
    bindings: {
        process: '<',
        onSelectFiles: '&',
        onLinkFilesToSamples: '&',
        onSelectSamples: '&',
        onAddSample: '&',
        onAddMultipleSamples: '&',
    }
});