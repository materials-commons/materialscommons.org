Application.Directives.directive("sampleFromTemplate", [sampleFromTemplateDirective]);
function sampleFromTemplateDirective() {
    return {
        restrict: "E",
        replace: true,
        scope: {
            template: "=template"
        },
        controller: "sampleFromTemplateDirectiveController",
        templateUrl: "application/core/projects/project/samples/sample-from-template.html"
    };
}

Application.Controllers.controller("sampleFromTemplateDirectiveController",
                                   ["$scope",
                                    sampleFromTemplateDirectiveController]);

function sampleFromTemplateDirectiveController($scope) {
    $scope.searchInput = {
        category: ""
    };
    //console.dir($scope.template);
}
