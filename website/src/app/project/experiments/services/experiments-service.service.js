class ExperimentsService {
    /*@ngInject*/
    constructor(projectsAPI) {
        this.projectsAPI = projectsAPI;
    }

    getAllForProject(projectID) {
        return this.projectsAPI(projectID).one('experiments').getList();
    }

    createForProject(projectID, experiment) {
        return this.projectsAPI(projectID).one('experiments').customPOST(experiment);
    }

    updateForProject(projectID, experimentID, what) {
        return this.projectsAPI(projectID).one('experiments', experimentID).customPUT(what);
    }

    getForProject(projectID, experimentID) {
        return this.projectsAPI(projectID).one('experiments', experimentID).customGET();
    }

    createStep(projectID, experimentID, experimentStep) {
        return this.projectsAPI(projectID).one('experiments', experimentID).one('step').customPOST(experimentStep);
    }
}

angular.module('materialscommons').service('experimentsService', ExperimentsService);
