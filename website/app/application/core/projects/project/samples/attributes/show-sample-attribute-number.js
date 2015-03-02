Application.Directives.directive("showSampleAttributeNumber", showSampleAttributeNumberDirective);
function showSampleAttributeNumberDirective() {
    return {
        restrict: "E",
        replace: true,
        scope: {
            attribute: "=attribute",
            edit: "=edit"
        },
        controller: "showSampleAttributeNumberDirectiveController",
        templateUrl: "application/core/projects/project/samples/attributes/show-sample-attribute-number.html"
    };
}

Application.Controllers.controller("showSampleAttributeNumberDirectiveController",
                                   ["$scope", showSampleAttributeNumberDirectiveController]);
function showSampleAttributeNumberDirectiveController($scope) {

}
