(function (module) {

    module.controller('LogoutController', LogoutController);

    LogoutController.$inject = ["$rootScope", "$state", "User", "model.projects"];

    /* @ngInject */
    function LogoutController($rootScope, $state, User, projects) {
        $rootScope.email_address = '';
        User.setAuthenticated(false);
        projects.clear();
        $state.transitionTo('home');
    }

}(angular.module('materialscommons')));