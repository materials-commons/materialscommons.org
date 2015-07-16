Application.Directives.directive('sidebarProcessDetails', sidebarProcessDetailsDirective);
function sidebarProcessDetailsDirective() {
    return {
        restrict: "EA",
        scope: true,
        templateUrl: 'application/core/projects/project/processes/sidebar-process-details.html'
    };
}
