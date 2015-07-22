Application.Directives.directive('sidebarFiles', sidebarFilesDirective);
function sidebarFilesDirective() {
    return {
        restrict: "EA",
        scope: true,
        templateUrl: 'sidebar-files.html'
    };
}
