import {ProjectStore} from './project-store';

class MCProjectStoreService {
    /*@ngInject*/
    constructor(projectsAPI) {
        this.projectsAPI = projectsAPI;
        this.currentProjectId = "";
        this.projectStore = new ProjectStore();
    }

    loadProject(projectId) {
        this.projectsAPI.getProjectV3(projectId).then(p => {
            this.projectStore.addProject(p);
            this.currentProjectId = p.id;
        });
    }

    getCurrentProject() {
        return this.projectStore.getProject(this.currentProjectId);
    }
}

angular.module('materialscommons').service('mcprojectstore2', MCProjectStoreService);