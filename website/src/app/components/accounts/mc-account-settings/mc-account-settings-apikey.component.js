angular.module('materialscommons').component('mcAccountSettingsApikey', {
    template: require('./mc-account-settings-apikey.html'),
    controller: MCAccountSettingsApikeyComponentController
});

/*@ngInect*/
function MCAccountSettingsApikeyComponentController(accountsAPI, User, Restangular) {
    const ctrl = this;

    ctrl.showKey = false;
    ctrl.showHideButtonText = 'Show API Key';
    ctrl.apikey = User.apikey();

    ctrl.showAPIKey = showAPIKey;
    ctrl.resetAPIKey = resetAPIKey;

    //////////////////

    function showAPIKey() {
        ctrl.showKey = !ctrl.showKey;
        if (!ctrl.showKey) {
            ctrl.showHideButtonText = 'Show API Key';
        } else {
            ctrl.showHideButtonText = 'Hide API Key';
        }
    }

    function resetAPIKey() {
        accountsAPI.resetApiKey().then(
            ({apikey}) => {
                User.reset_apikey(apikey);
                ctrl.apikey = apikey;
                Restangular.setDefaultRequestParams({apikey: User.apikey()});
            }
        );
    }
}
