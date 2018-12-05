class MCWorkflowSidebarComponentController {
    /*@ngInject*/
    constructor() {
        console.log('mcWorkflowSidebar');
        this.state = {
            currentProcess: null,
        };
    }

    $onChanges(changes) {
        console.log('MCWorkflowSidebar', changes);
        if (changes.currentProcess) {
            console.log('MCWorkflowSidebar changes', changes);
            this.state.currentProcess = angular.copy(changes.currentProcess.currentValue);
        }
    }
}

angular.module('materialscommons').component('mcWorkflowSidebar', {
    controller: MCWorkflowSidebarComponentController,
    template: require('./workflow-sidebar.html'),
    bindings: {
        currentProcess: '<',
    }
});