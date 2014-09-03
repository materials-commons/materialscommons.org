Application.Directives.directive('actionStack', ["actionStackTracker", "$compile", actionStackDirective]);

function actionStackDirective(actionStackTracker, $compile) {
    return {
        compile: function (element, attrs) {
            return function(scope, e) {
                scope.toggleStackAction = function(action, actionStackID, useID, args) {
                    var id = useID ? useID : 'action-' + action;
                    var actionDirective = "<div action-" + action + "></div>";

                    if (args) {
                        actionDirective = "<div action-" + action + " args='" + args + "'></div>";
                    }
                    var t = '<div ui-draggable="false" id="' + id + '" class="col-lg-12"><hr class="carved"/><div>' + actionDirective + '</div></div>';
                    if (!actionStackTracker.actionActive(id)) {
                        actionStackTracker.pushAction(id);
                        $('#' + actionStackID).append($compile(t)(scope));
                    } else if (actionStackTracker.toggleOff(id)) {
                        $("#" + id).remove();
                    }
                };

                scope.actionActive = function(action, useID) {
                    var id = useID ? useID : 'action-' + action;
                    return actionStackTracker.actionActive(id);
                };
            };
        }
    };
}
