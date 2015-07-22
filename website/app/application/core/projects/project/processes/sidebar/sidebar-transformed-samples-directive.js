Application.Directives.directive('sidebarTransformedSamples', sidebarTransformedSamplesDirective);
function sidebarTransformedSamplesDirective() {
    return {
        restrict: "EA",
        scope: true,
        templateUrl: 'sidebar-transformed-samples.html'
    };
}
