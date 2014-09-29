Application.Directives.directive("popoverHtmlUnsafePopup", popoverHtmlUnsafePopupDirective);

function popoverHtmlUnsafePopupDirective() {
    return {
        restrict: "EA",
        replace: true,
        scope: {
            title: "@",
            content: "@",
            placement: "@",
            animation: "&",
            isOpen: "&"
        },
        templateUrl: "application/directives/popover-html-unsafe-popup.html"
    };
}

Application.Directives.directive("popoverHtmlUnsafe",
                                 ["$tooltip", popoverHtmlUnsafeDirective]);
function popoverHtmlUnsafeDirective($tooltip) {
    return $tooltip("popoverHtmlUnsafe", "popover", "click");
}
