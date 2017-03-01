/*@ngInject*/
function focusService($timeout, $window) {
    return function(id) {
        $timeout(function() {
            let element = $window.document.getElementById(id);
            if (element) {
                element.focus();
            }
        });
    };
}

angular.module('materialscommons').factory('focus', focusService);

