class AccountsService {
    /*@ngInject*/
    constructor(apiService) {
        this.apiService = apiService;
    }

    createAccount(fullname, email) {
        return this.apiService('accounts').customPOST({
            fullname: fullname,
            email: email
        });
    }

    getUserDataForVerifyFromUuid(uuid) {
        console.log("AccountsService: getUserDataForVerifyFromUuid");
//        return this.apiService('accounts').customPOST({
//            uuid: uuid
//        });
        return {error: 'Umimplemented'}
    }
}

angular.module('materialscommons').service('accountsService', AccountsService);
