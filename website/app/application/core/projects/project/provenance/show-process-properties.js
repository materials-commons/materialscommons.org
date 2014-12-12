Application.Directives.directive("showProcessProperties", showProcessPropertiesDirective);
function showProcessPropertiesDirective() {
    return {
        scope: {
            properties: "=properties"
        },
        restrict: "AE",
        replace: true,
        templateUrl: "application/core/projects/project/provenance/show-process-properties.html"
    };
}
