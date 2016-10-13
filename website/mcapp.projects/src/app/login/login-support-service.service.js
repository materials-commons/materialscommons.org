class LoginSupportService {
    /*@ngInject*/
    constructor(apiService) {
        this.apiService = apiService;
    }

    clearPasswordResetRequest(user) {
        console.log("client - login - clearPasswordResetRequest: " + user.id);
        return this.apiService('accounts').one('clear-reset-password').customPOST({
            id: user.id
        });
    }
}

angular.module('materialscommons').service('loginSupportService', LoginSupportService);