(function (module) {
    module.controller("AccountSettingsController", AccountSettingsController);

    AccountSettingsController.$inject = ["mcapi", "User", "toastr"];

    /* @ngInject */
    function AccountSettingsController(mcapi, User, toastr) {
        var ctrl = this;
        ctrl.fullname = User.attr().fullname;
        ctrl.updateName = updateName;

        ///////////////////////////

        function updateName() {
            mcapi('/users/%', ctrl.mcuser.email)
                .success(function () {
                    User.attr.fullname = ctrl.fullname;
                    User.save();
                    toastr.success('User name updated', 'Success', {
                        closeButton: true
                    });
                }).error(function () {
                }).put({fullname: ctrl.fullname});
        }
    }
}(angular.module('materialscommons')));
