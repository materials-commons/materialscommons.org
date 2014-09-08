Application.Directives.directive('actionStack', ["$rootScope", "actionStackTracker", "$compile", actionStackDirective]);

function actionStackDirective($rootScope, actionStackTracker, $compile) {
    return {
        compile: function (element, attrs) {

            return function(scope, e) {
                scope.toggleStackAction = function(action, title, useID, args) {
                    var id = useID ? useID : action;
                    var actionDirective = "<div action-" + action + "></div>";
                    var actionTitle = title ? title : id;

                    if (args) {
                        actionDirective = "<div action-" + action + " args='" + args + "'></div>";
                    }

                    var t = '<div style="margin-bottom: 25px;" ui-draggable="false" id="' + id + '" class="row col-lg-12"><a name="' + id + '"></a><hr class="carved"/>';
                    t = t + '<div><div class="col-lg-offset-5"><h4>' + actionTitle + '</h4></div>' + actionDirective + '</div></div>';

                    if (!actionStackTracker.actionActive(id)) {
                        actionStackTracker.pushAction(id, title);
                        $('#action-stack').append($compile(t)(scope));
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
