(function (module) {
    module.directive('sidebarProcessDetails', sidebarProcessDetailsDirective);
    function sidebarProcessDetailsDirective() {
        return {
            restrict: "EA",
            scope: true,
            templateUrl: 'application/core/projects/project/processes/sidebar/sidebar-process-details.html'
        };
    }
}(angular.module('materialscommons')));
