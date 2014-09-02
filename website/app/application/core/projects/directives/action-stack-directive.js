Application.Directives.directive('actionStack', ["actionStackTracker", "$compile", actionStackDirective]);

function actionStackDirective(actionStackTracker, $compile) {
    return {
        compile: function (element, attrs) {
            return function(scope, e) {
                scope.toggleStackAction = function(action, actionStackID) {
                    var id = 'action-' + action;
                    var t = '<div ui-draggable="false" id="' + id + '" class="col-lg-12"><hr class="carved"/><div class="col-lg-offset-1"><div action-' + action + '></div></div></div>';
                    if (!actionStackTracker.actionActive(action)) {
                        actionStackTracker.pushAction(action);
                        $('#' + actionStackID).append($compile(t)(scope));
                    } else if (actionStackTracker.toggleOff(action)) {
                        $("#" + id).remove();
                    }
                };

                scope.actionActive = function(action) {
                    return actionStackTracker.actionActive(action);
                };
            };
        }
    };
}
