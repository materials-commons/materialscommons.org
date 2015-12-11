(function (module) {
    module.directive('ngConfirmClick', confirmClickDirective);
    function confirmClickDirective() {
        return {
            priority: 1,
            terminal: true,
            link: function (scope, element, attr) {
                var msg = attr.ngConfirmClick || "Are you sure?";
                var clickAction = attr.ngClick;
                element.bind('click', function () {
                    if (window.confirm(msg)) {
                        scope.$eval(clickAction)
                    }
                });
            }
        };
    }
}(angular.module('materialscommons')));
