class MCGlobusAuthTestingComponentController{
    /*@ngInject*/
    constructor(User, etlServerAPI) {
        console.log("MCGlobusAuthTestingComponentController - constructor()");
        this.etlServerAPI = etlServerAPI;
        this.userId = '';
        if (User.isAuthenticated()) {
            this.userId = User.attr().id;
        }
    }

    $onInit() {
        console.log("MCGlobusAuthTestingComponentController - onInit()");
        this.etlServiceAPI.getGlobusAuthStatus().then(
            (retVal) => {
                console.log(retVal);
            }
        )
    }
}

angular.module('materialscommons').component('mcGlobusAuthTesting', {
    template: require('./mc-globus-auth-testing.html'),
    controller: MCGlobusAuthTestingComponentController,
});
