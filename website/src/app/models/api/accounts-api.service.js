class AccountsAPIService {
    /*@ngInject*/
    constructor(apiService, Restangular, toast) {
        this.apiService = apiService;
        this.Restangular = Restangular;
        this.toast = toast;
    }

    createAccount(name, email, password) {
        return this.Restangular.one('v3').one('createNewUser').customPOST({
            email: email,
            fullname: name,
            password: password,
        }).then(u => u.plain().data);
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

    getUserForResetPassword(uuid) {
        return this.apiService('users').one('rvalidate', uuid).get();
    }

    resetUserPasswordWithValidate(uuid, password) {
        return this.Restangular.one('user').one('rvalidate', uuid).one('finish').customPOST({
            password: password
        });
    }
}

angular.module('materialscommons').service('accountsAPI', AccountsAPIService);
