(function (module) {
    module.component("mcProjectNavbar", {
        templateUrl: 'components/project/mc-project-navbar.html',
        controller: 'MCProjectNavbarComponentController'
    });

    module.controller('MCProjectNavbarComponentController', MCProjectNavbarComponentController);
    MCProjectNavbarComponentController.$inject = ['project', '$state'];
    function MCProjectNavbarComponentController(project, $state) {
        var ctrl = this;

        ctrl.currentTab = getCurrentTabIndex();
        ctrl.project = project.get();

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
