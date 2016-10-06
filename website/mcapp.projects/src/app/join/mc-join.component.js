class MCJoinComponentController {
    /*@ngInject*/
    constructor(accountsService, $state) {
        this.accountsService = accountsService;
        this.$state = $state;
        this.firstName = '';
        this.lastName = '';
        this.email = '';
        this.message = null;
        this.showSuccessMsg = false;
    }

    requestValidationLink(joinForm) {
        if (joinForm.$invalid) {
            return;
        }

        if (!this.allFieldsValid()) {
            return;
        }

        this.accountsService.createAccount(`${this.firstName} ${this.lastName}`, this.email)
            .then(
                () => this.showSuccessMsg = true,
                (e) => this.message = `${e.data.error}`
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