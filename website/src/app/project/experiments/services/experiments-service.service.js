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
}

angular.module('materialscommons').service('experimentsService', ExperimentsService);
