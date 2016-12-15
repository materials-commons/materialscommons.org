class WorkflowService {
    /*@ngInject*/
    constructor() {
        this.onDeleteCallbacks = {};
        this.onChangeCallbacks = {};
        this.onAddCallbacks = {};
        this.onSelectCallbacks = {};
        this.workflowDeleteCallback = null;
        this.workflowAddCallback = null;
        this.workflowChangeCallback = null;
    }

    addOnSelectCallback(name, cb) {
        this.onSelectCallbacks[name] = cb;
        return this;
    }

    deleteOnSelectCallback(name) {
        delete this.onSelectCallbacks[name];
        return this;
    }

    callOnSelectCallbacks(what) {
        for (let key in this.onSelectCallbacks) {
            let cb = this.onSelectCallbacks[key];
            cb(what);
        }
    }

    addOnDeleteCallback(name, cb) {
        this.onDeleteCallbacks[name] = cb;
        return this;
    }

    deleteOnDeleteCallback(name) {
        delete this.onDeleteCallbacks[name];
        return this;
    }

    addOnChangeCallback(name, cb) {
        this.onChangeCallbacks[name] = cb;
        return this;
    }

    deleteOnChangeCallback(name) {
        delete this.onChangeCallbacks[name];
        return this;
    }

    addOnAddCallback(name, cb) {
        this.onAddCallbacks[name] = cb;
        return this;
    }

    deleteOnAddCallback(name) {
        delete this.onAddCallbacks[name];
        return this;
    }

    sendWorkflowDelete() {
        if (this.workflowDeleteCallback) {
            this.workflowDeleteCallback();
        }
    }

    sendWorkflowAdd() {
        if (this.workflowAddCallback) {
            this.workflowAddCallback();
        }
    }

    sendWorkflowChange() {
        if (this.workflowChangeCallback) {
            this.workflowChangeCallback();
        }
    }

    setWorkflowDeleteCallback(cb) {
        this.workflowDeleteCallback = cb;
        return this;
    }

    setWorkflowAddCallback(cb) {
        this.workflowAddCallback = cb;
        return this;
    }

    setWorkflowChangeCallback(cb) {
        this.workflowChangeCallback = cb;
        return this;
    }

    clearWorkflowChangeCallbacks() {
        this.workflowChangeCallback = null;
        this.workflowAddCallback = null;
        this.workflowDeleteCallback = null;
    }
}


angular.module('materialscommons').service('workflowService', WorkflowService);