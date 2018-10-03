class MCGlobusAuthTestingComponentController{
    /*@ngInject*/
    constructor(User, etlServerAPI) {
        this.etlServerAPI = etlServerAPI;
        this.userId = User.attr().id;
        this.globusStatus = null;
        this.loggedIn = false;
        this.loginUrl = null;
        this.logoutUrl = null;
        this.details = []
    }

    $onInit() {
        this.refreshGlobusStatus();
    }

    refreshGlobusStatus() {
        console.log('refreshGlobusStatus');
        this.etlServerAPI.getGlobusAuthStatus().then(
            (retVal) => {
                this.details = [];
                this.globusStatus = retVal.status;
                this.loggedIn = this.globusStatus.authenticated;
                if (this.loggedIn) {
                    let token_keys = ['auth.globus.org', 'transfer.api.globus.org'];
                    for (let i = 0; i < token_keys.length; i++){
                        let key = token_keys[i];
                        this.details.push(key + ', access: ' +  this.globusStatus.validated[key].access)
                        this.details.push(key + ', refresh: ' +  this.globusStatus.validated[key].refresh)
                        console.log(this.globusStatus.validated[key].expires);
                        let s = this.globusStatus.validated[key].expires;
                        if (s > 0) {
                            let d = new Date();
                            d.setTime(1000 * s);
                            console.log(d.toString());
                            this.details.push(key + ', expires: ' + d.toString());
                        }
                    }
                }
                else {
                    this.details.push("Not Authenticated")
                }
            }
        )
    }

    globusLogin(){
        console.log('globusLogin');
        this.etlServerAPI.globusLogin().then(
            (loginInfo) => {
                this.loginUrl = loginInfo.url;
                this.loggedin = true;
            }
        )
    }

    resetFromLogin(){
        this.loginUrl = null;
        this.globusStatus = null;
        this.loggedin = false;
    }

    resetFromLogout() {
        this.logoutUrl = null;
        this.globusStatus = null;
        this.loggedin = true;
    }

    globusLogout(){
        console.log('globusLogout');
        this.etlServerAPI.globusLogout().then(
            (retVal) => {
                this.logoutUrl = retVal.url;
                this.loggedin = false;
            }
        )
    }
}

angular.module('materialscommons').component('mcGlobusAuthTesting', {
    template: require('./mc-globus-auth-testing.html'),
    controller: MCGlobusAuthTestingComponentController,
});
