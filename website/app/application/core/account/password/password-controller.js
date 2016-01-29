(function (module) {
    module.controller('AccountPasswordController', AccountPasswordController);

    AccountPasswordController.$inject = ["mcapi", "User", "toastr", "focus"];

    /* @ngInject */
    function AccountPasswordController(mcapi, User, toastr, focus) {
        var ctrl = this;
        ctrl.newPassword = null;
        ctrl.verifyNewPassword = null;

        ctrl.changePassword = changePassword;

        //////////////

        function changePassword() {
            if (ctrl.newPassword) {
                if (ctrl.newPassword === ctrl.verifyNewPassword) {
                    mcapi('/user/%/password', User.u(), ctrl.newPassword)
                        .success(function () {
                            toastr.success("Password updated successfully", {
                                closeButton: true
                            });
                            resetPasswordFields();
                        }).error(function (data) {
                        toastr.error("Unable to update password: " + data.error, {
                            closeButton: true
                        });
                        resetPasswordFields();
                    }).put({password: ctrl.newPassword});
                } else {
                    toastr.error("Passwords do not match.", {
                        closeButton: true
                    });
                    resetPasswordFields();
                }
            }
        }

        function resetPasswordFields() {
            focus('inputPassword');
            ctrl.newPassword = '';
            ctrl.verifyNewPassword = '';
        }
    }
}(angular.module('materialscommons')));