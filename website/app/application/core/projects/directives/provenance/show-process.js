Application.Directives.directive('showProcess', showProcessDirective);

function showProcessDirective() {
    return {
        scope: {
            process: "=",
            templateName: "="
        },
        controller: "showProcessDirectiveController",
        restrict: "EA",
        templateUrl: "application/core/projects/directives/provenance/show-process.html"
    };
}

Application.Controllers.controller("showProcessDirectiveController",
                                   ["$scope", showProcessDirectiveController]);

function showProcessDirectiveController($scope) {

}
