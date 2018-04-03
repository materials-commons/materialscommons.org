class MCJoinComponentController {
    /*@ngInject*/
    constructor(accountsAPI, $state) {
        this.accountsAPI = accountsAPI;
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

        this.accountsAPI.createAccount(`${this.firstName} ${this.lastName}`, this.email)
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
    template: require('./mc-join.html'),
    controller: MCJoinComponentController
});
