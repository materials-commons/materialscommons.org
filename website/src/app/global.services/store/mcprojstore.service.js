import {MCStore, EVTYPE} from './mcstore';
import transformers from './transformers';

class MCProjStoreService {
    constructor() {
        this.mcstore = new MCStore("mcprojstore", {
            projects: {},
            currentProjectId: null,
            currentExperimentId: null,
            currentProcessId: null
        });

        this.EVADD = EVTYPE.EVADD;
        this.EVREMOVE = EVTYPE.EVREMOVE;
        this.EVUPDATE = EVTYPE.EVUPDATE;
        this.EVSET = EVTYPE.EVSET;
        this.OTPROJECT = 'OTPROJECT';
        this.OTEXPERIMENT = 'OTEXPERIMENT';
        this.OTPROCESS = 'OTPROCESS';
        this._knownOTypes = [this.OTPROJECT, this.OTEXPERIMENT, this.OTPROCESS];
    }

    ready() {
        return this.mcstore.storeReady();
    }

    reset() {
        return this.mcstore.reset({
            projects: {},
            currentProjectId: null,
            currentExperimentId: null,
            currentProcessId: null
        });
    }

    remove() {
        return this.mcstore.removeStore();
    }

    get projects() {
        return _.values(this.mcstore.store.projects);
    }

    getProject(projectId) {
        this.mcstore.set(store => store.currentProjectId = projectId);
        let store = this.mcstore.getStore();
        return store.projects[projectId];
    }

    addProject(project) {
        return this.mcstore.add(store => {
            store.projects[project.id] = transformers.transformProject(project);
        });
    }

    addProjects(...projects) {
        return this.mcstore.add(store => {
            projects.forEach(p => {
                store.projects[p.id] = transformers.transformProject(p);
            });
        });
    }

    updateCurrentProject(fn) {
        return this.mcstore.update(store => {
            const currentProj = getCurrentProjectFromStore(store);
            fn(currentProj, transformers);
        });
    }

    removeCurrentProject() {
        return this.mcstore.remove(store => {
            delete store.projects[store.currentProjectId];
            store.currentProjectId = store.currentExperimentId = store.currentProcessId = null;
        });
    }

    get currentProject() {
        return this._getCurrentProject();
    }

    set currentProject(proj) {
        this.mcstore.set((store) => store.currentProjectId = proj.id);
    }

    _getCurrentProject() {
        let store = this.mcstore.getStore();
        return store.projects[store.currentProjectId];
    }

    addExperiment(experiment) {
        return this.mcstore.add(store => {
            const currentProject = getCurrentProjectFromStore(store);
            currentProject.experiments[experiment.id] = experiment;
        });
    }

    updateCurrentExperiment(fn) {
        return this.mcstore.update(store => {
            const currentExperiment = getCurrentExperimentFromStore(store);
            fn(currentExperiment);
        })
    }

    removeCurrentExperiment() {
        return this.mcstore.remove(store => {
            const currentProject = getCurrentProjectFromStore(store);
            delete currentProject.experiments[store.currentExperimentId];
            store.currentExperimentId = null;
        })
    }

    removeExperiments(...experiments) {
        return this.mcstore.remove(store => {
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
        this.mcstore.set(store => store.currentExperimentId = e.id);
    }

    getExperiment(experimentId) {
        this.mcstore.set(store => store.currentExperimentId = experimentId);
        return this._getCurrentExperiment();
    }

    setCurrentExperiment(experimentId) {
        return this.mcstore.set(store => store.currentExperimentId = experimentId);
    }

    _getCurrentExperiment() {
        const currentProject = this._getCurrentProject();
        let store = this.mcstore.getStore();
        return currentProject.experiments[store.currentExperimentId];
    }

    addProcess(p) {
        return this.mcstore.add(store => {
            const currentExperiment = getCurrentExperimentFromStore(store);
            currentExperiment.processes[p.id] = p;
        });
    }

    updateCurrentProcess(fn) {
        return this.mcstore.update(store => {
            const currentProcess = getCurrentProcessFromStore(store);
            fn(currentProcess);
        });
    }

    removeCurrentProcess() {
        return this.mcstore.remove(store => {
            const currentExperiment = getCurrentExperimentFromStore(store);
            delete currentExperiment.processes[store.currentProcessId];
            store.currentProcessId = null;
        });
    }

    get currentProcess() {
        return this._getCurrentProcess();
    }

    set currentProcess(p) {
        this.mcstore.set(store => store.currentProcessId = p.id);
    }

    getProcess(processId) {
        this.setCurrentProcess(processId);
        return this._getCurrentProcess();
    }

    setCurrentProcess(processId) {
        return this.mcstore.set(store => store.currentProcessId = processId);
    }

    _getCurrentProcess() {
        let store = this.mcstore.getStore();
        return this._getCurrentExperiment().processes[store.currentProcessId];
    }

    subscribe(otype, event, fn) {
        if (!this._knownOType(otype)) {
            throw new Error(`Unknown Object Type ${otype}`);
        }
        return this._subscribe(otype, event, fn);
    }

    _knownOType(otype) {
        return this._knownOTypes.indexOf(otype) !== -1;
    }

    _subscribe(otype, event, fn) {
        return this.mcstore.subscribe(event, store => {
            this._fnFire(otype, event, store, fn);
        });
    }

    _fnFire(otype, event, store, fn) {
        switch (otype) {
            case this.OTPROJECT:
                return this._fnFireProject(event, store, fn);
            case this.OTEXPERIMENT:
                return this._fnFireExperiment(event, store, fn);
            case this.OTPROCESS:
                return this._fnFireProcess(event, store, fn);
            default:
                return;
        }
    }

    _fnFireProject(event, store, fn) {
        if (event === this.EVUPDATE || event === this.EVSET) {
            const currentProj = getCurrentProjectFromStore(store);
            fn(currentProj);
        } else {
            fn(store.projects);
        }
    }

    _fnFireExperiment(event, store, fn) {
        if (event === this.EVUPDATE || event === this.EVSET) {
            const currentExperiment = getCurrentExperimentFromStore(store);
            fn(currentExperiment);
        } else {
            const currentProject = getCurrentProjectFromStore(store);
            fn(currentProject.experiments);
        }

        // Force subscriptions on projects to fire by generating an update to current project that doesn't do anything.
        //this.updateCurrentProject(() => null);
    }

    _fnFireProcess(event, store, fn) {
        if (event === this.EVUPDATE || event === this.EVSET) {
            const currentProcess = getCurrentProcessFromStore(store);
            fn(currentProcess);
        } else {
            const currentExperiment = getCurrentExperimentFromStore(store);
            fn(currentExperiment.processes);
        }

        // Force subscription on experiments to fire by generating an update to current experiment that doesn't do anything.
        //this.updateCurrentExperiment(() => null);
    }
}

angular.module('materialscommons').service('mcprojstore', MCProjStoreService);

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

