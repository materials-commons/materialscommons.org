Application.Directives.directive('createProcess', createProcessDirective);
function createProcessDirective() {
    return {
        restrict: "E",
        scope: true,
        templateUrl: 'application/core/projects/project/processes/create-process.html'
    };
}