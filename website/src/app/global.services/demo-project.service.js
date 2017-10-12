class demoProjectService {
    /*@ngInject*/
    constructor(apiService) {
        this.apiService = apiService;
    }

    buildDemoProject(user_id) {
        return this.apiService('users', user_id).one('create_demo_project').put().then(p => p.plain());
    }

}

angular.module('materialscommons').service('demoProjectService', demoProjectService);