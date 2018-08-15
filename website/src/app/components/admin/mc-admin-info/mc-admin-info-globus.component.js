class MCAdminInfoGlobusComponentController {
    /*@ngInject*/
    constructor(etlServerAPI, toast) {
        this.etlServerAPI = etlServerAPI;
        this.toast = toast;
        this.globusInfo = {};
        this.mcProcessStatusListLoaded = false;
        this.mcProcessStatusList = [];
        this.ccTaskListLoaded = false;
        this.ccTaskList = [];
    }

    $onInit() {
        this.etlServerAPI.getGlobusTransferAdminInfo().then(
            (results) => {
                this.globusInfo = results;
            }
        );
        this.etlServerAPI.getGlobusTransferAdminStatus().then(
            (results) => {
                this.mcProcessStatusList = results;
                this.mcProcessStatusListLoaded = true;
            }
        );
        this.etlServerAPI.getGlobusConfidentialClientTaskList().then(
            (results) => {
                this.ccTaskList = results;
                this.ccTaskListLoaded = true;
            }
        );
    }

}

angular.module('materialscommons').component('mcAdminInfoGlobus', {
    template: require('./mc-admin-info-globus.html'),
    controller: MCAdminInfoGlobusComponentController
});
