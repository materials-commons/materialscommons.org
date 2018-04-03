class MCResetPasswordComponentController {
    /*@ngInject*/
    constructor(accountsAPI) {
        this.accountsAPI = accountsAPI;
        this.email = '';
        this.message = null;
        this.showSuccessMsg = false;
    }

    requestResetLink(resetForm) {
        if (resetForm.$invalid) {
            return;
        }
        this.accountsAPI.createResetPasswordRequest(this.email)
            .then(
                () => this.showSuccessMsg = true,
                (e) => this.message = `${e.data.error}`
            );
    }
}

angular.module('materialscommons').component('mcResetPassword', {
    template: require('./mc-reset-password.html'),
    controller: MCResetPasswordComponentController
});

