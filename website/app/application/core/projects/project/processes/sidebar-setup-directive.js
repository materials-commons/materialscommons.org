Application.Directives.directive('sidebarSetup', sidebarSetupDirective);
function sidebarSetupDirective() {
    return {
        restrict: "EA",
        scope: true,
        templateUrl: 'application/core/projects/project/processes/sidebar-setup.html'
    };
}
