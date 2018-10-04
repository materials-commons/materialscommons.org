class ExperimentsAPIService {
    /*@ngInject*/
    constructor(projectsAPIRoute) {
        this.projectsAPIRoute = projectsAPIRoute;
    }

    getAllForProject(projectID) {
        return this.projectsAPIRoute(projectID).one('experiments').getList().then(experiments => experiments.plain());
    }

    createForProject(projectID, experiment) {
        return this.projectsAPIRoute(projectID).one('experiments').customPOST(experiment).then((e) => e.plain());
    }

    updateForProject(projectID, experimentID, what) {
        return this.projectsAPIRoute(projectID).one('experiments', experimentID).customPUT(what).then(e => e.plain());
    }

    mergeExperiments(projectID, experimentIds, newExperimentArgs) {
        return this.projectsAPIRoute(projectID).one('experiments').one('merge').customPOST({
            experiments: experimentIds,
            name: newExperimentArgs.name,
            description: newExperimentArgs.description
        }).then(e => e.plain());
    }

    deleteProcess(projectId, experimentId, processId) {
        return this.projectsAPIRoute(projectId).one('experiments', experimentId).one('processes', processId).customDELETE();
    }

    deleteExperiments(projectId, experimentIds) {
        return this.projectsAPIRoute(projectId).one('experiments').one('delete').customPOST({
            experiments: experimentIds
        });
    }

    getForProject(projectID, experimentID) {
        return this.projectsAPIRoute(projectID).one('experiments', experimentID).customGET().then(e => e.plain());
    }


    updateProcess(projectId, experimentId, processId, updateArgs) {
        return this.projectsAPIRoute(projectId)
            .one('experiments', experimentId)
            .one('processes', processId).customPUT(updateArgs)
            .then((process) => this.convertDatePropertyAttributes(process.plain()));
    }


    getSamplesForExperiment(projectId, experimentId) {
        return this.projectsAPIRoute(projectId).one('experiments', experimentId).one('samples')
            .customGET().then(samples => samples.plain());
    }

    getProcessesForExperiment(projectId, experimentId) {
        return this.projectsAPIRoute(projectId).one('experiments', experimentId)
            .customGET("processes").then(processes => processes.plain());
    }

    getProcessForExperiment(projectId, experimentId, processId) {
        return this.projectsAPIRoute(projectId)
            .one('experiments', experimentId)
            .one('processes', processId).customGET()
            .then((process) => this.convertDatePropertyAttributes(process.plain()));
    }

    getFilesForExperiment(projectId, experimentId) {
        return this.projectsAPIRoute(projectId).one('experiments', experimentId).one('files')
            .customGET().then(files => files.plain());
    }

    createProcessFromTemplate(projectId, experimentId, templateId) {
        return this.projectsAPIRoute(projectId).one('experiments', experimentId).one('processes').one('templates', templateId)
            .customPOST().then(p => p.plain());
    }

    cloneProcess(projectId, experimentId, processId, cloneArgs) {
        return this.projectsAPIRoute(projectId).one('experiments', experimentId).one('processes', processId).one('clone')
            .customPOST(cloneArgs).then(p => p.plain());
    }

    createNote(projectID, experimentID, note) {
        return this.projectsAPIRoute(projectID).one('experiments', experimentID).one('notes')
            .customPOST(note).then(n => n.plain());
    }

    updateNote(projectID, experimentID, noteID, noteArgs) {
        return this.projectsAPIRoute(projectID).one('experiments', experimentID).one('notes', noteID)
            .customPUT(noteArgs).then(n => n.plain());
    }

    convertDatePropertyAttributes(process) {
        if (process.setup) {
            let setup = process.setup;
            for (let i = 0; i < setup.length; i++) {
                let s = setup[i];
                if (s.properties) {
                    let properties = s.properties;
                    for (let j = 0; j < properties.length; j++) {
                        let property = properties[j];
                        if (property.otype && (property.otype === 'date')) {
                            if (property.value) {
                                property.value = this.convertDateValueFromTransport(property.value);
                            }
                        }
                    }
                }
            }
        }
        return process;
    }

    convertDatePropertyAttributes2(process) {
        angular.forEach(process.setup, (s) => s.properties.filter(p => p.otype === 'date')
            .forEach(p => {
                if (p.value) {
                    p.value = this.convertDateValueFromTransport(p.value)
                }
            }));
    }

    convertDateValueForTransport(dateObj) {
        return dateObj.getTime();
    }

    convertDateValueFromTransport(dateNumber) {
        return new Date(dateNumber);
    }
}

angular.module('materialscommons').service('experimentsAPI', ExperimentsAPIService);
