(function (module) {

    module.controller('LogoutController', LogoutController);

    LogoutController.$inject = ["$rootScope", "$state", "$window",
        "User", "projectFiles", "model.projects"];

    /* @ngInject */
    function LogoutController($rootScope, $state, $window, User, projectFiles, projects) {
        $rootScope.email_address = '';
        $window.sessionStorage.removeItem('mcuser');
        User.setAuthenticated(false, '', '');
        projectFiles.clear();
        projects.clear();
        $state.transitionTo('home');
    }

}(angular.module('materialscommons')));