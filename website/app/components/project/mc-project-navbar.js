(function (module) {
    module.component("mcProjectNavbar", {
        templateUrl: 'components/project/mc-project-navbar.html',
        controller: 'MCProjectNavbarComponentController'
    });

    module.controller('MCProjectNavbarComponentController', MCProjectNavbarComponentController);
    MCProjectNavbarComponentController.$inject = ['project'];
    function MCProjectNavbarComponentController(project) {
        var ctrl = this;

        ctrl.project = project.get();
    }

}(angular.module('materialscommons')));
