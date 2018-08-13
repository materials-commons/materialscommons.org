class MCAdminInfoComponentController {
    /*@ngInject*/
    constructor($mdDialog) {
        console.log("MCAdminInfoComponentController - constructor");
        this.$mdDialog = $mdDialog;
    }

    $onInit() {
        console.log("MCAdminInfoComponentController - init");
    }

}

angular.module('materialscommons').component('mcAdminInfo', {
    template: require('./mc-admin-info.html'),
    controller: MCAdminInfoComponentController
});
