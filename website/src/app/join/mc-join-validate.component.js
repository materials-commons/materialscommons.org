class MCJoinValidateComponentController {
    /*@ngInject*/
    constructor(accountsService, $stateParams, $state) {
        this.accountsService = accountsService;
        this.$stateParams = $stateParams;
        this.$state = $state;
        this.fullname = "Glenn Tarcea";
    }
}

angular.module('materialscommons').component('mcJoinValidate', {
    templateUrl: 'app/join/mc-join-validate.html',
    controller: MCJoinValidateComponentController
});
