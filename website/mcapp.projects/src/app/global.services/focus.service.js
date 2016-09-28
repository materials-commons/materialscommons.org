export function focusService($timeout, $window) {
    'ngInject';

    return function(id) {
        $timeout(function() {
            var element = $window.document.getElementById(id);
            if (element) {
                element.focus();
            }
        });
    };
}

