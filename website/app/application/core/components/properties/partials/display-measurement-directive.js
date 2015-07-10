Application.Directives.directive('displayMeasurement', displayMeasurementDirective);
function displayMeasurementDirective() {
    return {
        restrict: "EA",
        scope: {
            measure: '=measure',
            currentProcess: '='
        },
        templateUrl: 'application/core/components/properties/partials/display-measurement.html'
    };
}
