Application.Directives.directive('actionStack', ["$rootScope", "actionStackTracker", "$compile", actionStackDirective]);

function actionStackDirective($rootScope, actionStackTracker, $compile) {
    return {
        compile: function (element, attrs) {

            return function(scope, e) {
                scope.toggleStackAction = function(action, actionStackID, useID, args) {
                    var id = useID ? useID : 'action-' + action;
                    var actionDirective = "<div action-" + action + "></div>";

                    if (args) {
                        actionDirective = "<div action-" + action + " args='" + args + "'></div>";
                    }
                    //var t = '<div "background-color:' + $rootScope.lastColor + '" ui-draggable="false" id="' + id + '" class="col-lg-12"><hr class="carved"/><div>' + actionDirective + '</div></div>';
                    var t = '<div ui-draggable="false" id="' + id + '" class="col-lg-12"><a href="#' + id + '"></a><hr class="carved"/><div>' + actionDirective + '</div></div>';
                    // if ($rootScope.lastColor == $rootScope.background) {
                    //     $rootScope.lastColor = "#e1e1e1";
                    // } else {
                    //     $rootScope.lastColor = $rootScope.background;
                    // }
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
