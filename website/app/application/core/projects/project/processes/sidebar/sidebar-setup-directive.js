Application.Directives.directive('sidebarSetup', sidebarSetupDirective);
function sidebarSetupDirective() {
    return {
        restrict: "EA",
        scope: true,
        templateUrl: 'sidebar-setup.html'
    };
}
