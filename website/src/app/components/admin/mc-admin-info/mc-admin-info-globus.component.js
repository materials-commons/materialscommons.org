class MCAdminInfoGlobusComponentController {
    /*@ngInject*/
    constructor(etlServerAPI, toast) {
        this.etlServerAPI = etlServerAPI;
        this.toast = toast;
        this.globusInfo = {};
        this.mcProcessListStatus = [];
    }

    $onInit() {
        console.log("Init - MCAdminInfoGlobusComponentController");
        this.etlServerAPI.getGlobusTransferAdminInfo().then(
            (results) => {
                this.globusInfo = results;
                console.log(this.globusInfo);
            }
        );
        this.etlServerAPI.getGlobusTransferAdminStatus().then(
            (results) => {
                this.mcProcessListStatus = results;
                console.log(this.mcProcessListStatus);
            }
        );
    }

}

angular.module('materialscommons').component('mcAdminInfoGlobus', {
    template: require('./mc-admin-info-globus.html'),
    controller: MCAdminInfoGlobusComponentController
});
