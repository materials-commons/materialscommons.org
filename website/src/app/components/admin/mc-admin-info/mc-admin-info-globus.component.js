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
        console.log("Init - MCAdminInfoGlobusComponentController");
        this.etlServerAPI.getGlobusTransferAdminInfo().then(
            (results) => {
                this.globusInfo = results;
                console.log(this.globusInfo);
            }
        );
        this.etlServerAPI.getGlobusTransferAdminStatus().then(
            (results) => {
                this.mcProcessStatusList = results;
                this.mcProcessStatusListLoaded = true;
                console.log(this.mcProcessStatusList);
                console.log(this.mcProcessStatusList.length);
            }
        );
        this.etlServerAPI.getGlobusConfidentialClientTaskList().then(
            (results) => {
                this.ccTaskList = results;
                this.ccTaskListLoaded = true;
                console.log(this.ccTaskList);
                console.log(this.ccTaskList.length);
            }
        );
    }

}

angular.module('materialscommons').component('mcAdminInfoGlobus', {
    template: require('./mc-admin-info-globus.html'),
    controller: MCAdminInfoGlobusComponentController
});
