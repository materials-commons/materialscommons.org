(function (module) {
    module.directive("samplesTab", samplesTabDirective);

    function samplesTabDirective() {
        return {
            scope: true,
            restrict: "E",
            templateUrl: "application/core/projects/project/processes/samples.html"
        };
    }
}(angular.module('materialscommons')));
