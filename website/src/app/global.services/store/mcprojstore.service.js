class MCProjStoreService {
    constructor() {
        this.store = {
            projects: {},
            currentProject: null,
            currentExperiment: null
        };
        this.bus = {
            'PROJECT$CHANGE': [],
            'EXPERIMENT$CHANGE': [],
            'PROCESS$CHANGE': [],
            'SAMPLE$CHANGE': [],
            'PROJECT$ADD': [],
            'EXPERIMENT$ADD': [],
            'PROCESS$ADD': [],
            'SAMPLE$ADD': []
        };
    }

    subscribe(which, listener) {
        if (!_.isFunction(listener)) {
            throw new Error('Listener must be a function');
        }

        if (!this._knownChangeListenerType(which)) {
            throw new Error(`Unknown change listener type: ${which}`);
        }

        this.bus[which].push(listener);
        return () => {
            const index = this.bus[which].indexOf(listener);
            if (index !== -1) {
                this.bus[which].splice(index, 1);
            }
        };
    }

    _knownChangeListenerType(which) {
        switch (which) {
            case this.constructor.PROJECT$CHANGE:
                return true;
            case this.constructor.PROCESS$CHANGE:
                return true;
            case this.constructor.EXPERIMENT$CHANGE:
                return true;
            case this.constructor.SAMPLE$CHANGE:
                return true;
            case this.constructor.PROJECT$ADD:
                return true;
            case this.constructor.EXPERIMENT$ADD:
                return true;
            case this.constructor.PROCESS$ADD:
                return true;
            case this.constructor.SAMPLE$ADD:
                return true;
            default:
                return false;
        }
    }

    getProjects() {
        _.values(this.store.projects);
    }

    addProject(project) {
        this.store.projects[project.id] = project;
        this._fire()
    }

    updateProject(id, fn) {
        let proj = _.findKey(this.store.projects, {id: id});
        if (proj) {
            fn(proj);
        }

        this._fire(this.PROJECT$CHANGE, proj);
    }

    updateCurrentProject(fn) {
        if (this.store.currentProject) {
            fn(this.store.currentProject);
        }
    }

    setCurrentProject(id) {
        this.store.currentProject = _.findKey(this.store.projects, {id: id});
    }

    getCurrentProject() {
        return this.store.currentProject;
    }

    setCurrentExperiment(id) {
        this.store.currentExperiment = _.findKey(this.store.currentProject.experiments, {id: id});
    }

    getCurrentExperiment() {
        return this.store.currentExperiment;
    }

    updateCurrentExperiment(fn) {
        if (this.store.currentExperiment) {
            fn(this.store.currentExperiment);
        }
    }

    _fire(which, ...args) {
        for (let fn in this.bus[which]) {
            fn(...args);
        }
    }

    get PROJECT$CHANGE() {
        return this.constructor.PROJECT$CHANGE;
    }

    get EXPERIMENT$CHANGE() {
        return this.constructor.EXPERIMENT$CHANGE;
    }

    get PROCESS$CHANGE() {
        return this.constructor.PROCESS$CHANGE;
    }

    get SAMPLE$CHANGE() {
        return this.constructor.SAMPLE$CHANGE;
    }

    get PROJECT$ADD() {
        return this.constructor.PROCESS$ADD;
    }

    get EXPERIMENT$ADD() {
        return this.constructor.EXPERIMENT$ADD;
    }

    get PROCESS$ADD() {
        return this.constructor.PROCESS$ADD;
    }

    get SAMPLE$ADD() {
        return this.constructor.SAMPLE$ADD;
    }
}

MCProjStoreService.PROJECT$CHANGE = 'PROJECT$CHANGE';
MCProjStoreService.EXPERIMENT$CHANGE = 'EXPERIMENT$CHANGE';
MCProjStoreService.PROCESS$CHANGE = 'PROCESS$CHANGE';
MCProjStoreService.SAMPLE$CHANGE = 'SAMPLE$CHANGE';
MCProjStoreService.PROJECT$ADD = 'PROJECT$ADD';
MCProjStoreService.EXPERIMENT$ADD = 'EXPERIMENT$ADD';
MCProjStoreService.PROCESS$ADD = 'PROCESS$ADD';
MCProjStoreService.SAMPLE$ADD = 'SAMPLE$ADD';


angular.module('materialscommons').service('mcprojstore', MCProjStoreService);
