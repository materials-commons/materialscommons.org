angular.module('mc.project').component("mcProjectNavbar", {
    templateUrl: 'app/project/mc-project-navbar.html',
    controller: MCProjectNavbarComponentController
});

function MCProjectNavbarComponentController(project, $state, $rootScope, $scope) {
    'ngInject';

    var ctrl = this;

    ctrl.currentTab = getCurrentTabIndex();
    ctrl.project = project.get();

    var unregister = $rootScope.$on('$stateChangeSuccess', function() {
        ctrl.currentTab = getCurrentTabIndex();
    });

    $scope.$on('$destroy', function() { unregister(); });

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
