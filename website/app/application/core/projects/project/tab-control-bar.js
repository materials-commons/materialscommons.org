Application.Directives.directive("tabControlBar", tabControlBarDirective);

function tabControlBarDirective() {
    return {
        transclude: true,
        restrict: "AE",
        templateUrl: "application/core/projects/project/tab-control-bar.html"
    };
}
