Application.Directives.directive("sampleEvents", sampleEventsDirective);

function sampleEventsDirective() {
    return {
        replace: true,
        restrict: "AE",
        templateUrl: "application/core/projects/project/samples/sample-events.html"
    };
}
