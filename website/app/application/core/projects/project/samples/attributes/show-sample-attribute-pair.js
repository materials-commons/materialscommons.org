Application.Directives.directive("showSampleAttributePair", showSampleAttributePairDirective);
function showSampleAttributePairDirective() {
    return {
        restrict: "E",
        replace: true,
        scope: {
            attribute: "=attribute",
            edit: "=edit"
        },
        controller: "showSampleAttributePairDirectiveController",
        templateUrl: "application/core/projects/project/samples/attributes/show-sample-attribute-pair.html"
    };
}

Application.Controllers.controller("showSampleAttributePairDirectiveController",
                                   ["$scope", showSampleAttributePairDirectiveController]);
function showSampleAttributePairDirectiveController($scope) {

}
