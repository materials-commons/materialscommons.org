(function(module) {
    module.component('mcUserApikey', {
        templateUrl: 'app/user/mc-user-apikey.html',
        controller: 'MCUserApikeyComponentController'
    });
    module.controller('MCUserApikeyComponentController', MCUserApikeyComponentController);
    MCUserApikeyComponentController.$inject = ["mcapi", "User"];
    /* @ngInject */
    function MCUserApikeyComponentController(mcapi, User) {
        var ctrl = this;

        ctrl.showKey = false;
        ctrl.showHideButtonText = "Show API Key";
        ctrl.apikey = User.apikey();

        ctrl.showAPIKey = showAPIKey;
        ctrl.resetAPIKey = resetAPIKey;

        //////////////////

        function showAPIKey () {
            ctrl.showKey = !ctrl.showKey;
            if (!ctrl.showKey) {
                ctrl.showHideButtonText = "Show API Key";
            } else {
                ctrl.showHideButtonText = "Hide API Key";
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
