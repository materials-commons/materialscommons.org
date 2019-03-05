class AccessAPIService {
    /*@ngInject*/
    constructor(Restangular, toast) {
        this.Restangular = Restangular;
        this.toast = toast;
    }

    addUserToProject(userId, projectId) {
        return this.Restangular.one('v3').one('addUserToProject').customPOST({
            user_id: userId,
            project_id: projectId,
        }).then(
            entry => entry.plain().data,
            e => this.toast.error(e.error)
        );
    }

    removeUserFromProject(userId, projectId) {
        return this.Restangular.one('v3').one('removeUserFromProject').customPOST({
            user_id: userId,
            project_id: projectId,
        }).then(
            entry => entry.plain().data,
            e => this.toast.error(e.error)
        );
    }

    getAllUsers() {
        return this.Restangular.one('v3').one('getAllUsers').customPOST().then(
            data => data.plain().data,
            e => this.toast.error(e.error)
        );
    }
}

angular.module('materialscommons').service('accessAPI', AccessAPIService);