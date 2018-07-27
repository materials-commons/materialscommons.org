class MCJoinComponentController {
    /*@ngInject*/
    constructor(accountsAPI, $state, $timeout) {
        this.accountsAPI = accountsAPI;
        this.$state = $state;
        this.$timeout = $timeout;
        this.firstName = '';
        this.lastName = '';
        this.email = '';
        this.password = '';
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
                (rv) => {
                    this.accountsAPI.setUserFromRegistrationData(rv.validate_uuid, this.password)
                        .then(
                            () => {
                                this.showSuccessMsg = true;
                                this.$timeout(() => this.$state.go('login'), 3000);
                            },
                            (e) => this.message = `${e.data.error}`
                        );
                },
                (e) => this.message = `${e.data.error}`
            );
    }

    allFieldsValid() {
        if (this.firstName === '' || this.lastName === '' || this.email === '' || this.password === '') {
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
