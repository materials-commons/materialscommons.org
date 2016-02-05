(function(module) {
    module.directive('samplesList', samplesListDirective);
    function samplesListDirective() {
        return {
            restrict: 'E',
            scope: {
                samples: '='
            },
            templateUrl: 'application/directives/partials/samples-list.html'
        };
    }
}(angular.module('materialscommons')));

