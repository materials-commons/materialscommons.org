export class AccountsService {
    /*@ngInject*/
    constructor(mcapi, Restangular) {
        this.mcapi = mcapi;
        this.Restangular = Restangular;
    }

    createAccount(fullname, email) {
        return this.mcapi('accounts').customPOST({
            fullname: fullname,
            email: email,
            site: 'mcpub'
        });
    }

    resetPassword(email) {
        return this.mcapi('accounts').one('reset').customPOST({
            email: email,
            site: 'mcpub'
        });
    }

    setUserFromRegistrationData(uuid, password) {
        return this.Restangular.one('user').one('complete', uuid).customPOST({
            password: password
        });
    }

    getUserRegistrationAccount(uuid) {
        return this.mcapi('users').one('validate', uuid).get();
    }

    getUserForResetPassword(uuid){
        return this.mcapi("users").one('rvalidate',uuid).get();
    }

    resetUserPasswordWithValidate(uuid,password) {
        return this.Restangular.one('user').one('rvalidate',uuid).one('finish').customPOST({
            password: password
        });
    }

}
