(function (module) {
    module.directive('sidebarSetup', sidebarSetupDirective);
    function sidebarSetupDirective() {
        return {
            restrict: "EA",
            scope: true,
            templateUrl: 'application/core/projects/project/processes/sidebar/sidebar-setup.html'
        };
    }
}(angular.module('materialscommons')));
