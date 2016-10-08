class AccountsService {
    /*@ngInject*/
    constructor(apiService, Restangular) {
        this.apiService = apiService;
        this.Restangular = Restangular;
    }

    createAccount(fullname, email) {
        return this.apiService('accounts').customPOST({
            fullname: fullname,
            email: email
        });
    }

    createResetPasswordRequest(email) {
        return this.apiService('accounts').customPOST({
            reset: true,
            email: email
        });
    }

    setUserFromRegistrationData(uuid, password) {
        return this.Restangular.one('user').one('complete', uuid).customPOST({
            password: password
        });
    }

    getUserRegistrationAccount(uuid) {
        return this.apiService('users').one('validate', uuid).get();
    }
}

angular.module('materialscommons').service('accountsService', AccountsService);
