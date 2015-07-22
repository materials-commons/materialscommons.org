Application.Directives.directive('sidebarProcessDetails', sidebarProcessDetailsDirective);
function sidebarProcessDetailsDirective() {
    return {
        restrict: "EA",
        scope: true,
        templateUrl: 'sidebar-process-details.html'
    };
}
