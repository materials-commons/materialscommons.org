Application.Directives.directive("onRepeatFinished", ["$timeout", onRepeatFinishedDirective]);
function onRepeatFinishedDirective($timeout) {
    return {
        restrict: "A",
        link: function(scope, element, attr) {
            if (scope.$last === true) {
                element.ready(function() {
                    $timeout(function() {
                        scope.$emit(attr.onRepeatFinished);
                    });
                });
            }
        }
    };
}
