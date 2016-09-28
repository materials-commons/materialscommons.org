// onEnter allows a method to be called when the enter key is pressed on an element.
export function onEnterDirective() {
    return function(scope, element, attrs) {
        element.bind("keydown keypress", function(event) {
            if (event.which === 13) {
                scope.$apply(function() {
                    scope.$eval(attrs.onEnter, {$event: event});
                });
                event.preventDefault();
            }
        });
    };
}

