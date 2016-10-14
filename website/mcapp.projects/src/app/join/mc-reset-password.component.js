class MCResetPasswordComponentController {
    /*@ngInject*/
    constructor(accountsService) {
        this.accountsService = accountsService;
        this.email = '';
        this.message = null;
        this.showSuccessMsg = false;
    }

    requestResetLink(resetForm) {
        if (resetForm.$invalid) {
            return;
        }
        this.accountsService.createResetPasswordRequest(this.email)
            .then(
                () => this.showSuccessMsg = true,
                (e) => this.message = `${e.data.error}`
            );
    }
}

angular.module('materialscommons').component('mcResetPassword', {
    templateUrl: 'app/join/mc-reset-password.html',
    controller: MCResetPasswordComponentController
});

