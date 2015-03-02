Application.Directives.directive("showSampleAttributeList", showSampleAttributeListDirective);
function showSampleAttributeListDirective() {
    return {
        restrict: "E",
        replace: true,
        scope: {
            attribute: "=attribute",
            edit: "=edit"
        },
        controller: "showSampleAttributeListDirectiveController",
        templateUrl: "application/core/projects/project/samples/attributes/show-sample-attribute-list.html"
    };
}

Application.Controllers.controller("showSampleAttributeListDirectiveController",
                                   ["$scope", showSampleAttributeListDirectiveController]);
function showSampleAttributeListDirectiveController($scope) {

}
