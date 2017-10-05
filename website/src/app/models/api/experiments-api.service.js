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
        return this.projectsAPIRoute(projectID).one('experiments', experimentID).customPUT(what);
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
        return this.projectsAPIRoute(projectID).one('experiments', experimentID).customGET();
    }

    createTask(projectID, experimentID, experimentTask) {
        return this.projectsAPIRoute(projectID).one('experiments', experimentID).one('tasks').customPOST(experimentTask);
    }

    updateTask(projectID, experimentID, taskID, task) {
        return this.projectsAPIRoute(projectID).one('experiments', experimentID).one('tasks', taskID).customPUT(task);
    }

    addTemplateToTask(projectID, experimentID, taskID, templateID) {
        return this.projectsAPIRoute(projectID).one('experiments', experimentID).one('tasks', taskID)
            .one('template', templateID).customPOST({});
    }

    updateTaskTemplateProperties(projectID, experimentID, taskID, updateArgs) {
        return this.projectsAPIRoute(projectID).one('experiments', experimentID).one('tasks', taskID)
            .one('template').customPUT(updateArgs);
    }

    updateTaskTemplateFiles(projectId, experimentId, taskId, updateFilesArgs) {
        return this.projectsAPIRoute(projectId).one('experiments', experimentId).one('tasks', taskId)
            .one('template').customPUT(updateFilesArgs);
    }

    updateTaskTemplateSamples(projectId, experimentId, taskId, updateSamplesArgs) {
        return this.projectsAPIRoute(projectId).one('experiments', experimentId).one('tasks', taskId)
            .one('template').customPUT(updateSamplesArgs);
    }

    updateProcess(projectId, experimentId, processId, updateArgs) {
        return this.projectsAPIRoute(projectId)
            .one('experiments', experimentId)
            .one('processes', processId).customPUT(updateArgs)
            .then((process) => this.convertDatePropertyAttributes(process));
    }

    deleteTask(projectID, experimentID, taskID) {
        return this.projectsAPIRoute(projectID).one('experiments', experimentID).one('tasks', taskID).customDELETE();
    }

    getSamplesForExperiment(projectId, experimentId) {
        return this.projectsAPIRoute(projectId).one('experiments', experimentId).one('samples').customGET();
    }

    getProcessesForExperiment(projectId, experimentId) {
        return this.projectsAPIRoute(projectId).one('experiments', experimentId).customGET("processes");//, {simple: true});
    }

    getProcessForExperiment(projectId, experimentId, processId) {
        return this.projectsAPIRoute(projectId)
            .one('experiments', experimentId)
            .one('processes', processId).customGET()
            .then((process) => this.convertDatePropertyAttributes(process));
    }

    getFilesForExperiment(projectId, experimentId) {
        return this.projectsAPIRoute(projectId).one('experiments', experimentId).one('files').customGET();
    }

    createProcessFromTemplate(projectId, experimentId, templateId) {
        return this.projectsAPIRoute(projectId).one('experiments', experimentId).one('processes').one('templates', templateId)
            .customPOST();
    }

    cloneProcess(projectId, experimentId, processId, cloneArgs) {
        return this.projectsAPIRoute(projectId).one('experiments', experimentId).one('processes', processId).one('clone')
            .customPOST(cloneArgs);
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
