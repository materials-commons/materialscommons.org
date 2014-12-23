Application.Directives.directive('mcTree', mcTreeDirective);

function mcTreeDirective() {
    return {
        restrict: "E",
        scope: {
            items: '=items',
            orderby: '=orderby',
            matches: '=matches'
        },
        replace: true,
        templateUrl: 'application/directives/mc-tree.html'
    };
}
