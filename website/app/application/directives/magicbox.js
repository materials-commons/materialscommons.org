Application.Directives.directive('magicbox', ["$document", "projectColors", magicboxDirective]);

// Create a draggable magic box set to the colors of the current project.
function magicboxDirective($document, projectColors) {
    return {
        restrict: "EA",
        template: "<div style='margin: 20px;' ng-transclude></div>",
        transclude: true,
        link: function(scope, element, attrs) {
            var startX = 0, startY = 0, x = 0, y = 0;
            var options = scope.$eval(attrs.magicbox);
            if (options) {
                console.dir(options);
            }
            element.css({
                borderColor: projectColors.getCurrentProjectColorLight()
            });
            element.addClass("magicbox");
            element.on('mousedown', function(event) {
                // Prevent default dragging of selected content
                event.preventDefault();
                startX = event.screenX - x;
                startY = event.screenY - y;
                $document.on('mousemove', mousemove);
                $document.on('mouseup', mouseup);
            });

            function mousemove(event) {
                y = event.screenY - startY;
                x = event.screenX - startX;
                element.css({
                    top: y + 'px',
                    left:  x + 'px'
                });
            }

            function mouseup() {
                $document.off('mousemove', mousemove);
                $document.off('mouseup', mouseup);
            }
        }
    };
}
