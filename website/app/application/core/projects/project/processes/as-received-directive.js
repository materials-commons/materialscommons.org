Application.Directives.directive('asReceived', asReceivedDirective);
function asReceivedDirective() {
    return {
        restrict: "E",
        scope: true,
        templateUrl: 'application/core/projects/project/processes/as-received.html'
    };
}