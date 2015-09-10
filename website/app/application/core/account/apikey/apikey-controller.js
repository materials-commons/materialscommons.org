(function (module) {
    module.controller('APIKeyController', APIKeyController);

    APIKeyController.$inject = ["mcapi", "User"];

    /* @ngInject */
    function APIKeyController(mcapi, User) {
        var ctrl = this;

        ctrl.showKey = false;
        ctrl.showHideButton = "Show API Key";
        ctrl.apikey = User.apikey();

        ctrl.showAPIKey = showAPIKey;
        ctrl.resetAPIKey = resetAPIKey;

        //////////////////

        function showAPIKey () {
            ctrl.showKey = !ctrl.showKey;
            if (!ctrl.showKey) {
                ctrl.showHideButton = "Show API Key";
            } else {
                ctrl.showHideButton = "Hide API Key";
            }
        }

        function resetAPIKey() {
            mcapi('/user/%/apikey/reset', User.u())
                .success(function (data) {
                    User.reset_apikey(data.apikey);
                }).put();
        }
    }
}(angular.module('materialscommons')));