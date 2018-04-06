import {ProjectStore} from './project-store';

class MCProjectStoreService {
    /*@ngInject*/
    constructor(projectsAPI) {
        this.projectsAPI = projectsAPI;
        this.projectStore = new ProjectStore();
    }

    loadProject(projectId) {
        this.projectsAPI.getProjectV3(projectId).then(p => this.projectStore.addProject(p));
    }
}

angular.module('materialscommons').service('mcprojectstore2', MCProjectStoreService);