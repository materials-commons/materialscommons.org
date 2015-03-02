Application.Directives.directive("showSampleAttributeLine", showSampleAttributeLineDirective);
function showSampleAttributeLineDirective() {
    return {
        restrict: "E",
        replace: true,
        scope: {
            attribute: "=attribute",
            edit: "=edit"
        },
        controller: "showSampleAttributeLineDirectiveController",
        templateUrl: "application/core/projects/project/samples/attributes/show-sample-attribute-line.html"
    };
}

Application.Controllers.controller("showSampleAttributeLineDirectiveController",
                                   ["$scope", showSampleAttributeLineDirectiveController]);
function showSampleAttributeLineDirectiveController($scope) {

}
