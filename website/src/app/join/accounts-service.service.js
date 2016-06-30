class AccountsService {
    /*@ngInject*/
    constructor(apiService) {
        this.apiService = apiService;
    }

    createAccount(fullname, email, password) {
        return this.apiService('accounts').customPOST({
            fullname: fullname,
            email: email,
            password: password
        });
    }
}

angular.module('materialscommons').service('accountsService', AccountsService);
