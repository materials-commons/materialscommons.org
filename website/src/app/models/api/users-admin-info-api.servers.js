class UsersAdminInfoAPIService {
    /*@ngInject*/
    constructor(apiService) {
        this.apiService = apiService;
    }

    getUsersAdminInfo() {
        return this.apiService('users').get();
    }
}

angular.module('materialscommons').service('usersAdminInfoAPI', UsersAdminInfoAPIService);
