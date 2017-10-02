import {MCStore, EVTYPE} from './mcstore';
import transformers from './transformers';

class MCProjStoreService {
    constructor() {
        this.mcstore = new MCStore({
            projects: {},
            currentProjectId: null,
            currentExperimentId: null,
            currentProcessId: null
        });

        this.EVADD = EVTYPE.EVADD;
        this.EVREMOVE = EVTYPE.EVREMOVE;
        this.EVUPDATE = EVTYPE.EVUPDATE;
        this.OTPROJECT = 'OTPROJECT';
        this.OTEXPERIMENT = 'OTEXPERIMENT';
        this.OTPROCESS = 'OTPROCESS';
        this._knownOTypes = [this.OTPROJECT, this.OTEXPERIMENT, this.OTPROCESS];
    }

    reset() {
        this.mcstore = new MCStore({
            projects: {},
            currentProjectId: null,
            currentExperimentId: null,
            currentProcessId: null
        });
    }

    get projects() {
        return _.values(this.mcstore.store.projects);
    }

    getProject(projectId) {
        this.mcstore.store.currentProjectId = projectId;
        return this.mcstore.store.projects[projectId];
    }

    addProject(project) {
        this.mcstore.add(store => {
            store.projects[project.id] = transformers.projectTransformer(project);
        });
    }

    addProjects(...projects) {
        this.mcstore.add(store => {
            projects.forEach(p => {
                store.projects[p.id] = transformers.projectTransformer(p);
            });
        });
    }

    updateCurrentProject(fn) {
        this.mcstore.update(store => {
            const currentProj = getCurrentProjectFromStore(store);
            fn(currentProj);
        });
    }

    removeCurrentProject() {
        this.mcstore.remove(store => {
            delete store.projects[store.currentProjectId];
            store.currentProjectId = store.currentExperimentId = store.currentProcessId = null;
        });
    }

    get currentProject() {
        return this._getCurrentProject();
    }

    set currentProject(proj) {
        this.mcstore.store.currentProjectId = proj.id;
    }

    _getCurrentProject() {
        return this.mcstore.projects[this.mcstore.store.currentProjectId];
    }

    addExperiment(experiment) {
        this.mcstore.add(store => {
            const currentProject = getCurrentProjectFromStore(store);
            currentProject.experiments[experiment.id] = experiment;
        });
    }

    updateCurrentExperiment(fn) {
        this.mcstore.update(store => {
            const currentExperiment = getCurrentExperimentFromStore(store);
            fn(currentExperiment);
        })
    }

    removeCurrentExperiment() {
        this.mcstore.remove(store => {
            const currentProject = getCurrentProjectFromStore(store);
            delete currentProject.experiments[store.currentExperimentId];
            store.currentExperimentId = null;
        })
    }

    removeExperiments(...experiments) {
        this.mcstore.remove(store => {
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
        this.mcstore.store.currentExperimentId = e.id;
    }

    _getCurrentExperiment() {
        const currentProject = this._getCurrentProject();
        return currentProject.experiments[this.mcstore.store.currentExperimentId];
    }

    addProcess(p) {
        this.mcstore.add(store => {
            const currentExperiment = getCurrentExperimentFromStore(store);
            currentExperiment.processes[p.id] = p;
        });
    }

    updateCurrentProcess(fn) {
        this.mcstore.update(store => {
            const currentProcess = getCurrentProcessFromStore(store);
            fn(currentProcess);
        });
    }

    removeCurrentProcess() {
        this.mcstore.remove(store => {
            const currentExperiment = getCurrentExperimentFromStore(store);
            delete currentExperiment.processes[store.currentProcessId];
            store.currentProcessId = null;
        });
    }

    get currentProcess() {
        return this._getCurrentProcess();
    }

    set currentProcess(p) {
        this.mcstore.store.currentProcessId = p.id;
    }

    _getCurrentProcess() {
        return this._getCurrentExperiment().processes[this.mcstore.store.currentProcessId];
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
                return _fnFireProject(event, store, fn);
            case this.OTEXPERIMENT:
                return _fnFireExperiment(event, store, fn);
            case this.OTPROCESS:
                return _fnFireProcess(event, store, fn);
            default:
                return;
        }
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

function _fnFireProject(event, store, fn) {
    if (event === EVTYPE.EVUPDATE) {
        const currentProj = getCurrentProjectFromStore(store);
        fn(currentProj);
    } else {
        fn(store.projects);
    }
}

function _fnFireExperiment(event, store, fn) {
    if (event === EVTYPE.EVUPDATE) {
        const currentExperiment = getCurrentExperimentFromStore(store);
        fn(currentExperiment);
    } else {
        const currentProject = getCurrentProjectFromStore(store);
        fn(currentProject.experiments);
    }

    // Force subscriptions on projects to fire by generating an update to current project that doesn't do anything.
    this.updateCurrentProject(() => null);
}

function _fnFireProcess(event, store, fn) {
    if (event === EVTYPE.EVUPDATE) {
        const currentProcess = getCurrentProcessFromStore(store);
        fn(currentProcess);
    } else {
        const currentExperiment = getCurrentExperimentFromStore(store);
        fn(currentExperiment.processes);
    }

    // Force subscription on experiments to fire by generating an update to current experiment that doesn't do anything.
    this.updateCurrentExperiment(() => null);
}
