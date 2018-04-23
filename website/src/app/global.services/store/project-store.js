export class ProjectStore {
    constructor() {
        this.store = {};
        this.experimentStore = new ExperimentStore();
        this.sampleStore = new SampleStore();
        this.processStore = new ProcessStore();
        this.relationshipStore = new RelationshipsStore();
    }

    addProject(project) {
        this.store[project.id] = angular.copy(project);
        this._wireRelationships(project);
    }

    getProject(projectId) {
        if (projectId in this.store) {
            let project = _.clone(this.store[projectId]);
            project.samples = [];
            this.relationshipStore.getProjectSampleIds(projectId).forEach(sid => {
                let sample = this.sampleStore.getSample(sid);
                sample.processes = [];
                let unorderedProcesses = [];
                this.relationshipStore.getSampleProcessIds(sid).forEach(p => {
                    let process = this.processStore.getProcess(p.process_id);
                    process.sample_id = sid;
                    process.property_set_id = p.property_set_id;
                    unorderedProcesses.push(process);
                });
                sample.processes = this._orderProcesses(unorderedProcesses);
                project.samples.push(sample);
            });

            project.experiments = [];
            this.relationshipStore.getProjectExperimentIds(projectId).forEach(eid => {
                let experiment = this.experimentStore.getExperiment(eid);
                experiment.samples = [];
                this.relationshipStore.getExperimentSampleIds(eid).forEach(sid => {
                    experiment.samples.push(this.sampleStore.getSample(sid));
                });
                project.experiments.push(experiment);
            });

            return project;
        }

        return null;
    }

    _orderProcesses(unorderedProcesses) {
        console.log('---_orderProcesses---');
        console.log('  unorderedProcesses', unorderedProcesses);
        let createProcess = null,
            orderedProcesses = [],
            processMap = {};
        unorderedProcesses.forEach(p => {
            if (p.process_type === 'create') {
                console.log('  setting createProcess to', p);
                createProcess = p;
            }
            const id = `${p.sample_id}/${p.property_set_id}`;
            if (!(id in processMap)) {
                processMap[id] = [];
            }
            processMap[id].push(p);
        });

        console.log('  processMap', processMap);

        orderedProcesses.push(createProcess);
        // let currentId = `${createProcess.sample_id}/${createProcess.property_set_id}`;
        // let allProcesses = unorderedProcesses.filter(p => p.id !== createProcess.id);
        // for(;;) {
        //     let processesMatchingId = processMap[currentId];
        //     orderedProcesses = orderedProcesses.concat(processesMatchingId);
        //     //allProcesses = allProcesses.filter(p => p.sample_id !==)
        // }
        return unorderedProcesses;
    }

    /*
     let processes = _.indexBy(this.sample.processes, 'process_id');
        this.sample.processesInTimeline = this.sample.processes.filter(
            (p) => processes[p.process_id].property_set_id === p.property_set_id
        );
     */

    _wireRelationships(project) {
        project.experiments.forEach(e => {
            this.experimentStore.addExperiment(e);
            this.relationshipStore.addExperimentToProject(project.id, e.id);
        });

        project.samples.forEach(s => {
            this.sampleStore.addSample(s);
            this.relationshipStore.addSampleToProject(project.id, s.id);
        });
        project.processes.forEach(p => this.processStore.addProcess(p));
        project.relationships.experiment2sample.forEach(e2s => {
            this.relationshipStore.addSampleToExperiment(e2s.experiment_id, e2s.sample_id);
        });

        project.relationships.process2sample.forEach(p2s => {
            this.relationshipStore.wireSampleAndProcess(p2s.sample_id, p2s.property_set_id, p2s.process_id);
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
            return _.clone(this.store[id]);
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
            return _.clone(this.store[id]);
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
        return _.clone(this.store[id]);
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

    addExperimentToProject(projectId, experimentId) {
        if (!(projectId in this.projectExperiments)) {
            this.projectExperiments[projectId] = {};
        }

        this.projectExperiments[projectId][experimentId] = true;
    }

    getProjectExperimentIds(projectId) {
        if (!(projectId in this.projectExperiments)) {
            return [];
        }

        return _.keys(this.projectExperiments[projectId]);
    }

    addSampleToExperiment(experimentId, sampleId) {
        if (!(experimentId in this.experimentSamples)) {
            this.experimentSamples[experimentId] = {};
        }

        this.experimentSamples[experimentId][sampleId] = true;
    }

    getExperimentSampleIds(experimentId) {
        if (!(experimentId in this.experimentSamples)) {
            return [];
        }

        return _.keys(this.experimentSamples[experimentId]);
    }

    addSampleToProcess(processId, sampleId, property_set_id) {
        if (!(processId in this.processSamples)) {
            this.processSamples[processId] = {};
        }

        this.processSamples[processId][sampleId] = property_set_id;
    }

    addProcessToSample(sampleId, property_set_id, processId) {
        if (!(sampleId in this.sampleProcesses)) {
            this.sampleProcesses[sampleId] = {};
        }

        this.sampleProcesses[sampleId][processId] = property_set_id;
    }

    getSampleProcessIds(sampleId) {
        if (!(sampleId in this.sampleProcesses)) {
            return [];
        }

        let processIds = [];
        _.forIn(this.sampleProcesses[sampleId], (value, key) => processIds.push({
            process_id: key,
            property_set_id: value
        }));
        return processIds;
        //return _.keys(this.sampleProcesses[sampleId]);
    }

    addSampleToProject(projectId, sampleId) {
        if (!(projectId in this.projectSamples)) {
            this.projectSamples[projectId] = {};
        }

        this.projectSamples[projectId][sampleId] = true;
    }

    getProjectSampleIds(projectId) {
        if (!(projectId in this.projectSamples)) {
            return [];
        }

        return _.keys(this.projectSamples[projectId]);
    }

    wireSampleAndProcess(sampleId, property_set_id, processId) {
        this.addSampleToProcess(processId, sampleId, property_set_id);
        this.addProcessToSample(sampleId, property_set_id, processId);
    }
}