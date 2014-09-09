Application.Directives.directive('processDetails', processDetailsDirective);

function processDetailsDirective() {
    return {
        scope: {
            process: "="
        },
        controller: "processDetailsController",
        restrict: "AE",
        templateUrl: "application/directives/process-details.html"
    };
}

Application.Controllers.controller('processDetailsController',
                                   ["$scope", processDetailsController]);
function processDetailsController($scope) {

}
