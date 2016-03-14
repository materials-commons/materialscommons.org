(function(module) {
    module.component("mcProjectNavbar", {
        templateUrl: 'app/project/mc-project-navbar.html',
        controller: 'MCProjectNavbarComponentController'
    });

    module.controller('MCProjectNavbarComponentController', MCProjectNavbarComponentController);
    MCProjectNavbarComponentController.$inject = ['project', '$state', '$rootScope'];
    function MCProjectNavbarComponentController(project, $state, $rootScope) {
        var ctrl = this;

        ctrl.currentTab = getCurrentTabIndex();
        ctrl.project = project.get();

        $rootScope.$on('$stateChangeSuccess', function() {
            ctrl.currentTab = getCurrentTabIndex();
        });

        /////////////////////

        function getCurrentTabIndex() {
            if ($state.includes('project.home')) {
                return 0;
            } else if ($state.includes('project.processes')) {
                return 1;
            } else if ($state.includes('project.samples')) {
                return 2;
            } else if ($state.includes('project.files')) {
                return 3;
            } else if ($state.includes('project.settings')) {
                return 4;
            }

            return 0;
        }
    }

}(angular.module('materialscommons')));
