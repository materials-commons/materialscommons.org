class AccountsAPIService {
    /*@ngInject*/
    constructor(apiService, Restangular) {
        this.apiService = apiService;
        this.Restangular = Restangular;
    }

    createAccount(fullname, email) {
        return this.apiService('accounts').customPOST({
            fullname: fullname,
            email: email
        }).then(a => a.plain());
    }

    createResetPasswordRequest(email) {
        return this.apiService('accounts').one('reset').customPOST({
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

    getUserForResetPassword(uuid){
        return this.apiService("users").one('rvalidate',uuid).get();
    }

    resetUserPasswordWithValidate(uuid,password) {
        return this.Restangular.one('user').one('rvalidate',uuid).one('finish').customPOST({
            password: password
        });
    }
}

angular.module('materialscommons').service('accountsAPI', AccountsAPIService);
