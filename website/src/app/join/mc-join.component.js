class MCJoinComponentController {
    /*@ngInject*/
    constructor(accountsService) {
        this.accountsService = accountsService;
        this.firstName = '';
        this.lastName = '';
        this.email = '';
        this.password = '';
        this.password2 = '';
        this.message = null;
    }

    createAccount(joinForm) {
        if (joinForm.$invalid) {
            return;
        }

        if (!this.allFieldsValid()) {
            return;
        }

        this.accountsService.createAccount(`${this.firstName} ${this.lastName}`, this.email, this.password)
            .then(
                () => null,
                () => this.message = 'Failed to create account'
            );
    }

    allFieldsValid() {
        if (this.firstName === '' || this.lastName === '' || this.email === '' || this.password === '' || this.password2 === '') {
            this.message = 'All fields are required';
            return false;
        } else if (this.password !== this.password2) {
            this.message = `Passwords don't match`;
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