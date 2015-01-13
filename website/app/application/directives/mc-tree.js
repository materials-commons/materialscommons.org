Application.Directives.directive('mcTree', mcTreeDirective);

function mcTreeDirective() {
    return {
        restrict: "E",
        scope: {
            items: '=items',
            orderby: '=orderby',
            matches: '=matches',
            bk: '=bk'
        },
        replace: true,
        templateUrl: 'application/directives/mc-tree.html'
    };
}
