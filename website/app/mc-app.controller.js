(function (module) {
    module.controller('MCAppController', MCAppController);
    MCAppController.$inject = ['User'];
    function MCAppController(User) {
        var ctrl = this;
        ctrl.isAuthenticated = User.isAuthenticated;
    }
}(angular.module('materialscommons')));
