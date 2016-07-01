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
}

angular.module('materialscommons').service('accountsService', AccountsService);
