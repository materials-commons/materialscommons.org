Application.Directives.directive("homeSampleDetails", homeSampleDetailsDirective);
function homeSampleDetailsDirective() {
    return {
        restrict: "AE",
        scope: true,
        replace: true,
        templateUrl: "application/core/projects/project/home/directives/home-sample-details.html"
    };
}
