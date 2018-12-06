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
}

angular.module('materialscommons').component('mcProcessEditor', {
    controller: MCProcessEditorComponentController,
    template: require('./process-editor.html'),
    bindings: {
        process: '<'
    }
});