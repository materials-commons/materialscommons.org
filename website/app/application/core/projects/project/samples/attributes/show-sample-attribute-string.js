Application.Directives.directive("showSampleAttributeString", showSampleAttributeStringDirective);
function showSampleAttributeStringDirective() {
    return {
        restrict: "E",
        replace: true,
        scope: {
            attribute: "=attribute",
            edit: "=edit"
        },
        controller: "showSampleAttributeStringDirectiveController",
        templateUrl: "application/core/projects/project/samples/attributes/show-sample-attribute-string.html"
    };
}

Application.Controllers.controller("showSampleAttributeStringDirectiveController",
                                   ["$scope", showSampleAttributeStringDirectiveController]);
function showSampleAttributeStringDirectiveController($scope) {

}
