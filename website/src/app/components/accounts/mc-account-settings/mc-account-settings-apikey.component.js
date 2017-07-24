angular.module('materialscommons').component('mcAccountSettingsApikey', {
    templateUrl: 'app/components/accounts/mc-account-settings/mc-account-settings-apikey.html',
    controller: MCAccountSettingsApikeyComponentController
});

/*@ngInect*/
function MCAccountSettingsApikeyComponentController(mcapi, User) {
    const ctrl = this;

    ctrl.showKey = false;
    ctrl.showHideButtonText = "Show API Key";
    ctrl.apikey = User.apikey();

    ctrl.showAPIKey = showAPIKey;
    ctrl.resetAPIKey = resetAPIKey;

    //////////////////

    function showAPIKey() {
        ctrl.showKey = !ctrl.showKey;
        if (!ctrl.showKey) {
            ctrl.showHideButtonText = "Show API Key";
        } else {
            ctrl.showHideButtonText = "Hide API Key";
        }
    }

    function resetAPIKey() {
        mcapi('/user/%/apikey/reset', User.u())
            .success(function(data) {
                User.reset_apikey(data.apikey);
            }).put();
    }
}