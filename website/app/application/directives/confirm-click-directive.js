
Application.Directives.directive('ngConfirmClick', confirmClickDirective);
function confirmClickDirective() {
    return {
        priority: 1,
        terminal: true,
        link: function (scope, element, attr) {
            console.log('yes');
            var msg = attr.ngConfirmClick || "Are you sure?";
            var clickAction = attr.ngClick;
            element.bind('click',function (event) {
                if ( window.confirm(msg) ) {
                    scope.$eval(clickAction)
                }
            });
        }
    };
}
