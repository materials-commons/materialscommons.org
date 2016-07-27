class MCJoinValidateComponentController {
    /*@ngInject*/
    constructor(accountsService, $stateParams, $state) {
        var ctrl = this;
        ctrl.uuid = $stateParams.validation_uuid;
        ctrl.accountsService = accountsService;
        ctrl.$stateParams = $stateParams;
        ctrl.$state = $state;
        ctrl.message = null;

//        ctrl.getData = () => {
//            console.log('MCJoinValidateComponentController.$onInit - call: ' + ctrl.uuid);
//            accountsService.getUserDataForVerifyFromUuid(ctrl.uuid).then(
//                (userData) => {
//                    console.log('MCJoinValidateComponentController.$onInit - data' + userData.id);
//                    ctrl.userData = userData;
//                },
//                (error) => {
//                    console.log('MCJoinValidateComponentController.$onInit - error: ' + error.data.error);
//                    this.message = 'getUserDataForVerifyFromUuid - failed'
//                }
//            )
//        };

        ctrl.setPassword = (setPasswordForm) => {
            console.log('MCJoinValidateComponentController.setPassword');
            ctrl.password = this.password1;

            if (setPasswordForm.$invalid) {
                return;
            }

            if (!this.allFieldsValid()) {
                return;
            }

            this.accountsService.setUserFromRegistrationData(ctrl.uuid,ctrl.password)
                .then(
                    () => this.showSuccessMsg = true,
                    (e) => this.message = `${e.data.error}`
                );
        };

        ctrl.allFieldsValid = () => {
            console.log('MCJoinValidateComponentController.allFieldsValid');
            console.log('this.password1: ' + this.password1 + ', this.password2:' + this.password2);
            if (this.password1 === '' || this.password2 === '') {
                this.message = 'Both fields are required';
                return false;
            }
            if (!(this.password1 === this.password2)) {
                this.message = "Password entries do not match";
                return false;
            }
            if (this.password.length < 6) {
                this.message = "Password must be at least 6 character in length";
                return false;
            }
            this.message = null;
            return true;
        };
    }

}

angular.module('materialscommons').component('mcJoinValidate', {
    templateUrl: 'app/join/mc-join-validate.html',
    controller: MCJoinValidateComponentController
});
