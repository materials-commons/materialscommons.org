(function (module) {
    module.directive("setupTab", setupTabDirective);

    function setupTabDirective() {
        return {
            scope: {
                current: "="
            },
            restrict: "E",
            templateUrl: "application/core/projects/project/processes/setup.html"
        };
    }
}(angular.module('materialscommons')));
