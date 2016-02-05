(function (module) {
    module.directive("displayItem", displayItemDirective);
    function displayItemDirective() {
        return {
            restrict: "E",
            replace: true,
            scope: {
                item: "=item",
                showSideboard: "=showSideboard"
            },
            templateUrl: "application/core/projects/project/home/directives/display-item.html"
        };
    }
}(angular.module('materialscommons')));
