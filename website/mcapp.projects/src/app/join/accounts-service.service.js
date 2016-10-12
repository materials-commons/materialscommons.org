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
        console.log("client - account-service - reset request: " + email);
        return this.apiService('accounts').one('reset').customPOST({
            email: email
        });
    }

    setUserFromRegistrationData(uuid, password) {
        console.log("client - account-service - setUserFromRegistrationData",uuid,password);
        return this.Restangular.one('user').one('complete', uuid).customPOST({
            password: password
        });
    }

    getUserRegistrationAccount(uuid) {
        return this.apiService('users').one('validate', uuid).get();
    }

    resetUserPasswordWithValidate(uuid,id,password) {
        return this.apiService('user',id).one('validate',uuid).one('password').customPOST({
            password: password
        });
    }
}

angular.module('materialscommons').service('accountsService', AccountsService);
