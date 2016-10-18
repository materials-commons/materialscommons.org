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
        console.log("client - AccountsService - resetPassword",email);
    }

    setUserFromRegistrationData(uuid, password) {
        return this.Restangular.one('user').one('complete', uuid).customPOST({
            password: password
        });
    }

    getUserRegistrationAccount(uuid) {
        return this.mcapi('users').one('validate', uuid).get();
    }
}
