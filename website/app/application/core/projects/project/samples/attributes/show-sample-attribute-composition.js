Application.Directives.directive("showSampleAttributeComposition", showSampleAttributeCompositionDirective);
function showSampleAttributeCompositionDirective() {
    return {
        restrict: "E",
        replace: true,
        scope: {
            attribute: "=attribute",
            edit: "=edit"
        },
        controller: "showSampleAttributeCompositionDirectiveController",
        templateUrl: "application/core/projects/project/samples/attributes/show-sample-attribute-composition.html"
    };
}

Application.Controllers.controller("showSampleAttributeCompositionDirectiveController",
                                   ["$scope", showSampleAttributeCompositionDirectiveController]);
function showSampleAttributeCompositionDirectiveController($scope) {

}
