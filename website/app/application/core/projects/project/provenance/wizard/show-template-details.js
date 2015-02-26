Application.Directives.directive("showTemplateDetails", showTemplateDetailsDirective);
function showTemplateDetailsDirective() {
    return {
        restrict: "E",
        replace: true,
        scope: {
            template: "=template",
        },
        controller: "showTemplateDetailsDirectiveController",
        templateUrl: "application/core/projects/project/provenance/wizard/show-template-details.html"
    };
}
Application.Controllers.controller("showTemplateDetailsDirectiveController",
    ["$scope", showTemplateDetailsDirectiveController]);

function showTemplateDetailsDirectiveController($scope) {
}
