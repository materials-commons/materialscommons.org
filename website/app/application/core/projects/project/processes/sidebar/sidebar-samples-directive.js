Application.Directives.directive('sidebarSamples', sidebarSamplesDirective);
function sidebarSamplesDirective() {
    return {
        restrict: "EA",
        scope: true,
        templateUrl: 'sidebar-samples.html'
    };
}
