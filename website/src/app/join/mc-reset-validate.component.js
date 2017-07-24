class MCResetValidateComponentController {
    /*@ngInject*/
    constructor(accountsAPI, $stateParams, $state, $timeout) {
        this.uuid = $stateParams.validation_uuid;
        this.accountsAPI = accountsAPI;
        this.$state = $state;
        this.message = null;
        this.password1 = '';
        this.password2 = '';
        this.showSuccessMsg = false;
        this.$timeout = $timeout;
    }

    $onInit() {
        this.accountsAPI.getUserForResetPassword(this.uuid)
            .then(
                (user) => {
                    this.user = user;
                },
                (e) => this.message = e.data.error
            );
    }

    setPassword(setPasswordForm) {
        if (!this.user) {
            this.message = "No validated user found for request. Please retry.";
            return;
        }

        if (setPasswordForm.$invalid) {
            return;
        }

        if (!this.allFieldsValid()) {
            return;
        }

        this.accountsAPI.resetUserPasswordWithValidate(this.uuid, this.password1)
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

angular.module('materialscommons').component('mcResetValidate', {
    templateUrl: 'app/join/mc-reset-validate.html',
    controller: MCResetValidateComponentController
});
