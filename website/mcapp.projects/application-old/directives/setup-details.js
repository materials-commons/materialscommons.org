(function(module) {
    module.directive('setupDetails', setupDetailsDirective);
    function setupDetailsDirective() {
        return {
            restrict: 'E',
            scope: {
                setup: '='
            },
            templateUrl: 'application/directives/partials/setup-details.html'
        };
    }
}(angular.module('materialscommons')));
