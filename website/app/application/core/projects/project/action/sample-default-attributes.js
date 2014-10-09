Application.Directives.directive("sampleDefaultAttributes", sampleDefaultAttributesDirective);

function sampleDefaultAttributesDirective() {
    return {
        replace: true,
        restrict: "AE",
        templateUrl: "application/core/projects/project/action/sample-default-attributes.html"
    };
}
