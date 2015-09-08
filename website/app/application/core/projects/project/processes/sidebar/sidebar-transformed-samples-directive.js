(function (module) {
    module.directive('sidebarTransformedSamples', sidebarTransformedSamplesDirective);
    function sidebarTransformedSamplesDirective() {
        return {
            restrict: "EA",
            scope: true,
            templateUrl: 'application/core/projects/project/processes/sidebar/sidebar-transformed-samples.html'
        };
    }
}(angular.module('materialscommons')));
