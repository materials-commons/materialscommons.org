Application.Directives.directive('actionStack', ["actionStackTracker", "$compile", actionStackDirective]);

function actionStackDirective(actionStackTracker, $compile) {
    return {
        compile: function (element, attrs) {
            return function(scope, e) {
                scope.toggleStackAction = function(action) {
                    var id = 'action-' + action;
                    var t = '<div id="' + id + '" class="col-lg-12"><hr class="carved"/><div class="col-lg-offset-1"><div action-' + action + '></div></div></div>';
                    if (!actionStackTracker.actionActive(action)) {
                        actionStackTracker.pushAction(action);
                        $('#action-stack').append($compile(t)(scope));
                    } else if (actionStackTracker.toggleOff(action)) {
                        $("#"+id).remove();
                    }
                };
            };
        }
    };
}
