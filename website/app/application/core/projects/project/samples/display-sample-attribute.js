Application.Directives.directive("displaySampleAttribute", displaySampleAttributeDirective);
function displaySampleAttributeDirective() {
    return {
        restrict: "E",
        replace: true,
        scope: {
            attribute: "=attribute",
            edit: "=edit"
        },
        controller: "displaySampleAttributeDirectiveController",
        templateUrl: "application/core/projects/project/samples/display-sample-attribute.html"
    };
}
Application.Controllers.controller("displaySampleAttributeDirectiveController",
                                   ["$scope",
                                    displaySampleAttributeDirectiveController]);

function displaySampleAttributeDirectiveController($scope) {
}
