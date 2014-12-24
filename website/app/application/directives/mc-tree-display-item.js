Application.Directives.directive("mcTreeDisplayItem", mcTreeDisplayItemDirective);
function mcTreeDisplayItemDirective() {
    return {
        restrict: "E",
        replace: true,
        scope: {
            item: "=item",
            showSideboard: "=showSideboard"
        },
         templateUrl: "application/directives/mc-tree-display-item.html"
    };
}
