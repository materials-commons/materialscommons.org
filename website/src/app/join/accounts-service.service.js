class AccountsService {
    /*@ngInject*/
    constructor(apiService,Restangular) {
        this.apiService = apiService;
        this.Restangular = Restangular;
    }

    createAccount(fullname, email) {
        return this.apiService('accounts').customPOST({
            fullname: fullname,
            email: email
        });
    }

    getUserDataForVerifyFromUuid(uuid) {
        console.log("AccountsService: getUserDataForVerifyFromUuid - uuid = " + uuid);
        var userData = this.apiService('users').one('validate', uuid).get();
        console.log("AccountsService: getUserDataForVerifyFromUuid - user data = " + userData);
        return userData;
    }

    setUserFromRegistrationData(id,password){
        return Restangular.one('user').one('complete',id).customPOST({
            password: password
        });
    }
}

angular.module('materialscommons').service('accountsService', AccountsService);
