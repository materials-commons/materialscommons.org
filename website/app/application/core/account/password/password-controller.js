(function (module) {
    module.controller('AccountPasswordController', AccountPasswordController);

    AccountPasswordController.$inject = ["mcapi", "User", "alertService"];

    /* @ngInject */
    function AccountPasswordController(mcapi, User, alertService) {
        var ctrl = this;
        ctrl.newPassword = null;
        ctrl.verifyNewPassword = null;

        ctrl.change = change;

        //////////////

        function change() {
            if (ctrl.newPassword) {
                if (ctrl.newPassword === ctrl.verifyNewPassword) {
                    mcapi('/user/%/password', User.u(), ctrl.newPassword)
                        .success(function () {
                            alertService.sendMessage("Password updated successfully");
                        }).error(function (data) {
                            alertService.sendMessage(data.error);
                        }).put({password: ctrl.newPassword});
                } else {
                    alertService.sendMessage("Passwords do not match.");
                }
            }
        }
    }
}(angular.module('materialscommons')));