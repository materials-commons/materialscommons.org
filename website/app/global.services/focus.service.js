(function(module) {
    module.factory('focus', focusService);
    focusService.$inject = ["$timeout", "$window"];

    function focusService($timeout, $window) {
        return function(id) {
            $timeout(function() {
                var element = $window.document.getElementById(id);
                if (element) {
                    element.focus();
                }
            });
        }
    }

}(angular.module('materialscommons')));
