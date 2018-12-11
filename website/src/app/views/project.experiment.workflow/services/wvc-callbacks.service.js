/*
** WorkflowViewContainerCallbacks service registers calls into the experiment-workflow-view-container. This
** allows short circuiting passing callbacks down through multiple components.
 */
class WvcCallbacksService {
    /*@ngInject*/
    constructor() {
        this.callbacks = {};
    }

    registerCallback(name, method) {
        this.callbacks[name] = method;
    }

    // handleAddSample() {
    //     return this.callbacks('handleAddSample')();
    // }

    handleUpdateProcess(processId, attrs) {
        return this.callbacks['handleUpdateProcess'](processId, attrs);
    }

    handleSelectFiles(process) {
        return this.callbacks['handleSelectFiles'](process);
    }
}

angular.module('materialscommons').service('wvcCallbacks', WvcCallbacksService);