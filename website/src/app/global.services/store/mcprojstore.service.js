import MCStore from './mcstore';

function getCurrentProjectFromStore(store) {
    return store.projects[store.currentProjectId];
}

function getCurrentExperimentFromStore(store) {
    const currentProj = getCurrentProjectFromStore(store);
    return currentProj.experiments[store.currentExperimentId];
}

function getCurrentProcessFromStore(store) {
    const currentExperiment = getCurrentExperimentFromStore(store);
    return currentExperiment.processes[store.currentProcessId];
}

class MCProjStoreService {
    constructor() {
        this.store = new MCStore({
            projects: {},
            currentProjectId: null,
            currentExperimentId: null,
            currentProcessId: null
        });

        this.EVADD = this.store.EVADD;
        this.EVREMOVE = this.store.EVREMOVE;
        this.EVUPDATE = this.store.EVUPDATE;
        this.OTPROJECT = 'OTPROJECT';
        this.OTEXPERIMENT = 'OTEXPERIMENT';
        this.OTPROCESS = 'OTPROCESS';
        this.knownOTypes = [this.OTPROJECT, this.OTEXPERIMENT, this.OTPROCESS];

    }

    reset() {
        this.store = new MCStore({
            projects: {},
            currentProjectId: null,
            currentExperimentId: null,
            currentProcessId: null
        });
    }

    get projects() {
        return _.values(this.store.projects);
    }

    subscribe(otype, event, fn) {
        if (!this._knownOType(otype)) {
            throw new Error(`Unknown Object Type ${otype}`);
        }
        return this._subscribe(otype, event, fn);
    }

    _knownOType(otype) {
        return _.findIndex(this.knownOTypes, otype) !== -1;
    }

    _subscribe(otype, event, fn) {
        return this.store.subscribe(event, store => {
            this._fnFire(otype, event, store, fn);
        });
    }

    _fnFire(otype, event, store, fn) {
        switch (otype) {
            case 'PROJECT':
                return this._fnFireProject(event, store, fn);
            case 'EXPERIMENT':
                return this._fnFireExperiment(event, store, fn);
            case 'PROCESS':
                return this._fnFireProcess(event, store, fn);
            default:
                return;
        }
    }

    _fnFireProject(event, store, fn) {
        if (event === this.store.EVUPDATE) {
            const currentProj = getCurrentProjectFromStore(store);
            fn(currentProj);
        } else {
            fn(store.projects);
        }
    }

    _fnFireExperiment(event, store, fn) {
        if (event === this.store.EVUPDATE) {
            const currentExperiment = getCurrentExperimentFromStore(store);
            fn(currentExperiment);
        } else {
            const currentProject = getCurrentProjectFromStore(store);
            fn(currentProject.experiments);
        }

        // Force subscriptions on projects to fire by generating an update to current project that doesn't do anything.
        this.updateCurrentProject(() => {
        });
    }

    _fnFireProcess(event, store, fn) {
        if (event === this.store.EVUPDATE) {
            const currentProcess = getCurrentProcessFromStore(store);
            fn(currentProcess);
        } else {
            const currentExperiment = getCurrentExperimentFromStore(store);
            fn(currentExperiment.processes);
        }

        // Force subscription on experiments to fire by generating an update to current experiment that doesn't do anything.
        this.updateCurrentExperiment(() => {
        });
    }

    addProject(project) {
        this.store.add(store => {
            store.projects[project.id] = project;
        });
    }

    addProjects(...projects) {
        this.store.add(store => {
            projects.forEach(p => {
                store.projects[p.id] = p;
            });
        });
    }

    updateCurrentProject(fn) {
        this.store.update(store => {
            const currentProj = getCurrentProjectFromStore(store);
            fn(currentProj);
        });
    }

    removeCurrentProject() {
        this.store.remove(store => {
            delete store.projects[store.currentProjectId];
            store.currentProjectId = store.currentExperimentId = store.currentProcessId = null;
        });
    }

    get currentProject() {
        return this._getCurrentProject();
    }

    set currentProject(proj) {
        this.store.currentProjectId = proj.id;
    }

    _getCurrentProject() {
        return this.store.projects[this.store.currentProjectId];
    }

    addExperiment(experiment) {
        this.store.add(store => {
            const currentProject = getCurrentProjectFromStore(store);
            currentProject.experiments[experiment.id] = experiment;
        });
    }

    updateCurrentExperiment(fn) {
        this.store.update(store => {
            const currentExperiment = getCurrentExperimentFromStore(store);
            fn(currentExperiment);
        })
    }

    removeCurrentExperiment() {
        this.store.remove(store => {
            const currentProject = getCurrentProjectFromStore(store);
            delete currentProject.experiments[store.currentExperimentId];
            store.currentExperimentId = null;
        })
    }

    removeExperiments(...experiments) {
        this.store.remove(store => {
            const currentProject = getCurrentProjectFromStore(store);
            experiments.forEach(e => {
                delete currentProject.experiments[e.id];
            });
        });
    }

    get currentExperiment() {
        return this._getCurrentExperiment();
    }

    set currentExperiment(e) {
        this.store.currentExperimentId = e.id;
    }

    _getCurrentExperiment() {
        const currentProject = this._getCurrentProject();
        return currentProject.experiments[this.store.currentExperimentId];
    }

    addProcess(p) {
        this.store.add(store => {
            const currentExperiment = getCurrentExperimentFromStore(store);
            currentExperiment.processes[p.id] = p;
        });
    }

    updateCurrentProcess(fn) {
        this.store.update(store => {
            const currentProcess = getCurrentProcessFromStore(store);
            fn(currentProcess);
        });
    }

    removeCurrentProcess() {
        this.store.remove(store => {
            const currentExperiment = getCurrentExperimentFromStore(store);
            delete currentExperiment.processes[store.currentProcessId];
            store.currentProcessId = null;
        });
    }

    get currentProcess() {
        return this._getCurrentProcess();
    }

    set currentProcess(p) {
        this.store.currentProcessId = p.id;
    }

    _getCurrentProcess() {
        return this._getCurrentExperiment().processes[this.store.currentProcessId];
    }
}

angular.module('materialscommons').service('mcprojstore', MCProjStoreService);
