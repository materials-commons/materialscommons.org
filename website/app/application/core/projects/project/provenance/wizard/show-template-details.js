Application.Directives.directive("showTemplateDetails",
                                 ["RecursionHelper", showTemplateDetailsDirective]);
function showTemplateDetailsDirective(RecursionHelper) {
    return {
        restrict: "E",
        replace: true,
        scope: {
            template: "=template",
        },
        controller: "showTemplateDetailsDirectiveController",
        templateUrl: "application/core/projects/project/provenance/wizard/show-template-details.html",
        compile: function(element) {
            return RecursionHelper.compile(element, function(scope, iElement, iAttrs, controller, transcludeFn) {
            });
        }
    };
}
Application.Controllers.controller("showTemplateDetailsDirectiveController",
                                   ["$scope", showTemplateDetailsDirectiveController]);

function showTemplateDetailsDirectiveController($scope) {
}
