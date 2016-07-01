class MCJoinComponentController {
    /*@ngInject*/
    constructor(accountsService) {
        this.accountsService = accountsService;
        this.firstName = '';
        this.lastName = '';
        this.email = '';
        this.message = null;
    }

    createAccount(joinForm) {
        if (joinForm.$invalid) {
            return;
        }

        if (!this.allFieldsValid()) {
            return;
        }

        this.accountsService.createAccount(`${this.firstName} ${this.lastName}`, this.email)
            .then(
                () => null,
                (error) => {
                    console.log('error', error);
                    this.message = 'Failed to create account';
                }
            );
    }

    allFieldsValid() {
        if (this.firstName === '' || this.lastName === '' || this.email === '') {
            this.message = 'All fields are required';
            return false;
        }

        this.message = null;
        return true;
    }
}

angular.module('materialscommons').component('mcJoin', {
    templateUrl: 'app/join/mc-join.html',
    controller: MCJoinComponentController
});