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

    resetApiKey() {
        return this.Restangular.one('v3').one('resetUserApikey').customPOST().then(
            data => data.plain().data,
            e => this.toast.error(e.data.error)
        );
    }

    changePassword(newPassword) {
        return this.Restangular.one('v3').one('changeUserPassword').customPOST({
            password: newPassword
        }).then(
            () => true,
            e => this.toast.error(e.data.error)
        );
    }

    resetUserPasswordWithValidate(uuid, password) {
        return this.Restangular.one('v3').one('resetUserPasswordFromUuid').customPOST({
            validate_uuid: uuid,
            password: password,
        }).then(
            () => true
        );
    }

    //////////////////

    createResetPasswordRequest(email) {
        return this.apiService('accounts').one('reset').customPOST({
            email: email
        });
    }

    getUserForResetPassword(uuid) {
        return this.apiService('users').one('rvalidate', uuid).get();
    }
}

angular.module('materialscommons').service('accountsAPI', AccountsAPIService);
