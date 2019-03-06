angular.module('materialscommons').component('mcAccountSettingsPassword', {
    template: require('./mc-account-settings-password.html'),
    controller: MCAccountSettingsPasswordComponentController
});

/*@ngInject*/
function MCAccountSettingsPasswordComponentController(accountsAPI, User, toast, focus) {
    const ctrl = this;
    ctrl.newPassword = null;
    ctrl.verifyNewPassword = null;
    //focus('inputPassword');

    ctrl.changePassword = changePassword;
    ctrl.cancel = cancel;

    //////////////

    function changePassword() {
        if (ctrl.newPassword) {
            if (ctrl.newPassword === ctrl.verifyNewPassword) {
                accountsAPI.changePassword(ctrl.newPassword).then(
                    () => {
                        toast.success('Password updated successfully', 'top left');
                        resetPasswordFields();
                    },
                    e => {
                        toast.error('Unable to update password: ' + e.data.error, 'top left');
                        resetPasswordFields();
                    }
                );
            } else {
                toast.error('Passwords do not match.', 'top left');
                resetPasswordFields();
            }
        }
    }

    function resetPasswordFields() {
        focus('inputPassword');
        ctrl.newPassword = '';
        ctrl.verifyNewPassword = '';
    }

    function cancel() {
    }
}
