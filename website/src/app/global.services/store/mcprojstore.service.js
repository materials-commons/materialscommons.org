import MCStore from './mcstore';

class MCProjStoreService {
    constructor() {
        this.store = new MCStore({
            projects: {},
            currentProjectId: null,
            currentExperimentId: null
        });
    }

    get projects() {
        return _.values(this.store.projects);
    }
}


angular.module('materialscommons').service('mcprojstore', MCProjStoreService);
