class MCJoinValidateComponentController {
    /*@ngInject*/
    constructor(accountsService, toast, $stateParams, $state) {
        var ctrl = this;
        ctrl.uuid = $stateParams.validation_uuid;
        ctrl.accountsService = accountsService;
        ctrl.toast = toast;
        ctrl.$stateParams = $stateParams;
        ctrl.$state = $state;
        ctrl.message = null;

        ctrl.$onInit = () => {
            accountsService.getUserDataForVerifyFromUuid(ctrl.uuid).then(
                (userData) => {
                    console.log('MCJoinValidateComponentController.$onInit - data' + userData.id);
                    ctrl.userData = userData;
                },
                (error) => {
                    console.log('MCJoinValidateComponentController.$onInit - error: ' + error.data.error);
                    this.message = 'getUserDataForVerifyFromUuid - failed'
                }
            )
        };

        ctrl.setPassword = (setPasswordForm) => {
            console.log('MCJoinValidateComponentController.setPassword');
        };
    }

}

angular.module('materialscommons').component('mcJoinValidate', {
    templateUrl: 'app/join/mc-join-validate.html',
    controller: MCJoinValidateComponentController
});
