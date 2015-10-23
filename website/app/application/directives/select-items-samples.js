(function (module) {
    module.directive('selectItemsSamples', selectItemsSamplesDirective);
    function selectItemsSamplesDirective() {
        return {
            restrict: 'E',
            scope: {
                samples: '='
            },
            templateUrl: 'application/directives/partials/select-items-samples.html'
        }
    }
}(angular.module('materialscommons')));

