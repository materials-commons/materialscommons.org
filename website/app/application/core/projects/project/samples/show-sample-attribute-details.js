Application.Directives.directive("showSampleAttributeDetails", showSampleAttributeDetailsDirective);
function showSampleAttributeDetailsDirective() {
    return {
        restrict: "E",
        replace: true,
        scope: {
            attribute: "=attribute",
            edit: "=edit"
        },
        controller: "showSampleAttributeDetailsDirectiveController",
        templateUrl: "application/core/projects/project/samples/show-sample-attribute-details.html"
    };
}
Application.Controllers.controller("showSampleAttributeDetailsDirectiveController",
                                   ["$scope",
                                    showSampleAttributeDetailsDirectiveController]);

function showSampleAttributeDetailsDirectiveController($scope) {
}
