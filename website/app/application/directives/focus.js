Application.Directives.directive('focus', ["$timeout", focusDirective]);

function focusDirective($timeout) {
    return {
        retrict: "A",
        scope: {
            focus: "@"
        },
        link: function($scope, $element, attrs) {
            $scope.$watch("focus", function(currentValue, previousValue) {
                $element[0].focus();
                // if (currentValue === true && !previousValue) {
                //     console.log("setting focus");
                //     $element[0].focus();
                // } else if (currentValue === false && previousValue) {
                //     $element[0].blur();
                // }
            });
        }
    };
}
