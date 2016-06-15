angular.module("materialscommons").directive('onKeyCode', onKeyCodeDirective);

/* This directive accepts a list of key codes. To get shift key code add a capital 'S' to your key code */
function onKeyCodeDirective() {
    return {
        restrict: 'A',
        link: function($scope, $element, $attrs) {
            $element.bind("keypress", function(event) {
                let keyCodes = $attrs.keyCodes ? $attrs.keyCodes.split(',') : [];
                var keyCode = event.which || event.keyCode;
                if (event.shiftKey) {
                    keyCode = "S" + keyCode;
                }
                if ($attrs.keyCode && keyCode == $attrs.keyCode) {
                    $scope.$apply(() => $scope.$eval($attrs.onKeyCode, {$event: event}));
                    event.preventDefault();
                } else if ($attrs.keyCodes && _.findIndex(keyCodes, keyCode) !== -1) {
                    $scope.$apply(() => $scope.$eval($attrs.onKeyCode, {$event: event}));
                    event.preventDefault();
                }
            });
        }
    };
}
