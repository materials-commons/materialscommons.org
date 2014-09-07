Application.Directives.directive('sideboard', sideboardDirective);

function sideboardDirective() {
    return {
        scope: {},
        restrict: "A",
        templateUrl: "application/core/projects/overview/sideboard.html"
    };
}
