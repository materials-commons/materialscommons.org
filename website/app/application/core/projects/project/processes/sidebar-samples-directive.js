Application.Directives.directive('sidebarSamples', sidebarSamplesDirective);
function sidebarSamplesDirective() {
    return {
        restrict: "EA",
        scope: true,
        templateUrl: 'application/core/projects/project/processes/sidebar-samples.html'
    };
}
