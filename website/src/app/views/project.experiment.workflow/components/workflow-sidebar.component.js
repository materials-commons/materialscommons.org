class MCWorkflowSidebarComponentController {
    /*@ngInject*/
    constructor() {
        this.state = {
            currentProcess: null,
            templates: [],
        };
    }

    $onChanges(changes) {
        if (changes.currentProcess) {
            this.state.currentProcess = angular.copy(changes.currentProcess.currentValue);
        }

        if (changes.templates) {
            this.state.templates = angular.copy(changes.templates.currentValue);
        }
    }

    addToGraph(template) {
        this.onAddNode({template: template});
    }
}

angular.module('materialscommons').component('mcWorkflowSidebar', {
    controller: MCWorkflowSidebarComponentController,
    template: require('./workflow-sidebar.html'),
    bindings: {
        currentProcess: '<',
        onAddNode: '&',
        templates: '<',
    }
});