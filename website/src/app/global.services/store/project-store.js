export class ProjectStore {
    constructor() {
        this.store = {};
        this.experimentStore = new ExperimentStore();
        this.sampleStore = new SampleStore();
        this.processStore = new ProcessStore();
        this.relationshipStore = new RelationshipsStore();
    }

    addProject(project) {
        // if (project.id in this.store) {
        //     return;
        // }

        this.store[project.id] = angular.copy(project);
        this._wireRelationships(project);
        // console.log('this.store', this.store);
        // console.log('this.experimentStore', this.experimentStore);
        // console.log('this.sampleStore', this.sampleStore);
        // console.log('this.processStore', this.processStore);
        // console.log('this.relationshipStore', this.relationshipStore);
    }

    getProject(projectId) {
        if (projectId in this.store) {
            return this.store[projectId];
        }

        return null;
    }

    _wireRelationships(project) {
        project.experiments.forEach(e => {
            this.experimentStore.addExperiment(e);
            this.relationshipStore.addExperimentToProject(project.id, e);
        });

        project.samples.forEach(s => {
            this.sampleStore.addSample(s);
            this.relationshipStore.addSampleToProject(project.id, s);
        });
        project.processes.forEach(p => this.processStore.addProcess(p));
        project.relationships.experiment2sample.forEach(e2s => {
            const e = this.experimentStore.getExperiment(e2s.experiment_id);
            const s = this.sampleStore.getSample(e2s.sample_id);
            this.relationshipStore.addSampleToExperiment(e.id, s);
        });

        project.relationships.process2sample.forEach(p2s => {
            const p = this.processStore.getProcess(p2s.process_id);
            const s = this.sampleStore.getSample(p2s.sample_id);
            this.relationshipStore.wireSampleAndProcess(s, p);
        });
    }
}

class SampleStore {
    constructor() {
        this.store = {};
    }

    addSample(sample) {
        if (sample.id in this.store) {
            return;
        }

        this.store[sample.id] = sample;
    }

    getSample(id) {
        if (id in this.store) {
            return this.store[id];
        }

        return null;
    }
}

class ProcessStore {
    constructor() {
        this.store = {};
    }

    addProcess(process) {
        if (process.id in this.store) {
            return;
        }

        this.store[process.id] = process;
    }

    getProcess(id) {
        if (id in this.store) {
            return this.store[id];
        }

        return null;
    }
}

class ExperimentStore {
    constructor() {
        this.store = {};
    }

    addExperiment(experiment) {
        if (experiment.id in this.store) {
            return;
        }

        this.store[experiment.id] = experiment;
    }

    getExperiment(id) {
        return this.store[id];
    }
}

class RelationshipsStore {
    constructor() {
        this.projectExperiments = {};
        this.sampleProcesses = {};
        this.processSamples = {};
        this.experimentSamples = {};
        this.projectSamples = {};
    }

    addExperimentToProject(projectId, experiment) {
        if (!(projectId in this.projectExperiments)) {
            this.projectExperiments[projectId] = {};
        }

        this.projectExperiments[projectId][experiment.id] = true;
    }

    addSampleToExperiment(experimentId, sample) {
        if (!(experimentId in this.experimentSamples)) {
            this.experimentSamples[experimentId] = {};
        }

        this.experimentSamples[experimentId][sample.id] = true;
    }

    addSampleToProcess(processId, sample) {
        if (!(processId in this.processSamples)) {
            this.processSamples[processId] = {};
        }

        this.processSamples[processId][sample.id] = true;
    }

    addProcessToSample(sampleId, process) {
        if (!(sampleId in this.sampleProcesses)) {
            this.sampleProcesses[sampleId] = {};
        }

        this.sampleProcesses[sampleId][process.id] = true;
    }

    addSampleToProject(projectId, sample) {
        if (!(projectId in this.projectSamples)) {
            this.projectSamples[projectId] = {};
        }

        this.projectSamples[projectId][sample.id] = true;
    }

    wireSampleAndProcess(sample, process) {
        this.addSampleToProcess(process.id, sample);
        this.addProcessToSample(sample.id, process);
    }
}