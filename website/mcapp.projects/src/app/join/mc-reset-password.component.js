class MCResetPasswordComponentController {
    /*@ngInject*/
    constructor(accountsService, $stateParams, $state, $timeout) {
        this.uuid = $stateParams.validation_uuid;
        this.accountsService = accountsService;
        this.$state = $state;
        this.email = '';
        this.message = null;
        this.showSuccessMsg = false;
    }

    $onInit() {
        console.log("uuid: ", this.uuid);
        this.accountsService.getUserRegistrationAccount(this.uuid)
            .then(
                (registration) => {
                    this.registration = registration;
                    console.log("this.registration: ", registration);
                },
                (e) => this.message = e.data.error
            );
    }

    setPassword(setPasswordForm) {
        if (setPasswordForm.$invalid) {
            return;
        }

        if (!this.allFieldsValid()) {
            return;
        }

        this.accountsService.setUserFromRegistrationData(this.uuid, this.password1)
            .then(
                () => {
                    this.showSuccessMsg = true;
                    this.$timeout(() => this.$state.go('login'), 5000);
                },
                (e) => this.message = `${e.data.error}`
            );
    }


    allFieldsValid() {
        if (this.password1 === '' || this.password2 === '') {
            this.message = 'Both fields are required';
            return false;
        }
        if (this.password1 !== this.password2) {
            this.message = "Password entries do not match";
            return false;
        }
        if (this.password1.length < 6) {
            this.message = "Password must be at least 6 character in length";
            return false;
        }
        this.message = null;
        return true;
    }
}

angular.module('materialscommons').component('mcJoinValidate', {
    templateUrl: 'app/join/mc-reset-password.html',
    controller: MCResetPasswordComponentController
});

