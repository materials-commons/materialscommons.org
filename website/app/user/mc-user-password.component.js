(function (module) {
    module.component('mcUserPassword', {
        templateUrl: 'app/user/mc-user-password.html',
        controller: 'MCUserPasswordComponentController'
    });

    module.controller('MCUserPasswordComponentController', MCUserPasswordComponentController);

    MCUserPasswordComponentController.$inject = ['mcapi', 'User', 'toastr', 'focus', '$previousState'];

    /* @ngInject */
    function MCUserPasswordComponentController(mcapi, User, toastr, focus, $previousState) {
        var ctrl = this;
        ctrl.newPassword = null;
        ctrl.verifyNewPassword = null;
        focus('inputPassword');

        ctrl.changePassword = changePassword;
        ctrl.cancel = cancel;

        //////////////

        function changePassword() {
            if (ctrl.newPassword) {
                if (ctrl.newPassword === ctrl.verifyNewPassword) {
                    mcapi('/user/%/password', User.u(), ctrl.newPassword)
                        .success(function () {
                            toastr.success('Password updated successfully', {
                                closeButton: true
                            });
                            $previousState.go();
                        })
                        .error(function (data) {
                            toastr.error('Unable to update password: ' + data.error, {
                                closeButton: true
                            });
                            resetPasswordFields();
                        }).put({password: ctrl.newPassword});
                } else {
                    toastr.error('Passwords do not match.', {
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

        function cancel() {
            $previousState.go();
        }
    }
}(angular.module('materialscommons')));
