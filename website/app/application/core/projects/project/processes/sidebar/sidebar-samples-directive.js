(function (module) {
    module.directive('sidebarSamples', sidebarSamplesDirective);
    function sidebarSamplesDirective() {
        return {
            restrict: "EA",
            scope: true,
            templateUrl: 'application/core/projects/project/processes/sidebar/sidebar-samples.html'
        };
    }
}(angular.module('materialscommons')));
