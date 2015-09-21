(function (module) {
    module.directive("filesTab", filesTabDirective);

    function filesTabDirective() {
        return {
            scope: {
                current: "="
            },
            restrict: "E",
            templateUrl: "application/core/projects/project/processes/files.html"
        };
    }
}(angular.module('materialscommons')));
