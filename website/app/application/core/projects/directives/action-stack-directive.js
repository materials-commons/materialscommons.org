Application.Directives.directive('actionStack', ["$rootScope", "actionStackTracker", "$compile", "hotkeys", "$location", "$anchorScroll", actionStackDirective]);

function actionStackDirective($rootScope, actionStackTracker, $compile,
                              hotkeys, $location, $anchorScroll) {
    return {
        compile: function (element, attrs) {

            return function(scope, e) {
                scope.toggleStackAction = function(action, title, useID, args) {

                    function _createHotkey(key, id, title) {
                        hotkeys.add({
                            combo: '' + key,
                            description: 'Goto ' + title,
                            callback: function() {
                                $location.hash(id);
                                $anchorScroll();
                            }
                        });
                        // if (key === parseInt(key)) {
                        //     hotkeys.add({
                        //         combo: 'x ' + key,
                        //         description: 'Close ' + title,
                        //         callback: function() {
                        //             $("#" + id).remove();
                        //             hotkeys.del('x ' + key);
                        //             hotkeys.del('' + key);
                        //             actionStackTracker.popAction(id);
                        //         }
                        //     });
                        // }
                    }

                    function _setHotkeys(oldlength) {
                        var i = 0;
                        for (i = 0; i < oldlength; i++) {
                            if (i > 8) {
                                break;
                            }
                            hotkeys.del('' + (i + 1));
                        }
                        var actions = actionStackTracker.actions;

                        for(i = 0; i < actions.length; i++) {
                            if (i > 8) {
                                break;
                            }
                            _createHotkey(i+1, actions[i].id, actions[i].title);
                        }
                    }

                    var id = useID ? useID : action;
                    var actionDirective = "<div action-" + action + "></div>";
                    var actionTitle = title ? title : id;
                    var oldActionsLength = actionStackTracker.actions.length;

                    if (args) {
                        actionDirective = "<div action-" + action + " args='" + args + "'></div>";
                    }

                    var t = '<div style="margin-bottom: 25px;" ui-draggable="false" id="' + id + '" class="row col-lg-12"><a name="' + id + '"></a><hr class="carved"/>';
                    t = t + '<div><div class="col-lg-offset-5"><h4>' + actionTitle + '</h4></div>' + actionDirective + '</div></div>';
                    if (!actionStackTracker.actionActive(id)) {
                        actionStackTracker.pushAction(id, title);
                        _setHotkeys(oldActionsLength);
                        $('#action-stack').append($compile(t)(scope));
                        $location.hash(id);
                        $anchorScroll();
                    } else if (actionStackTracker.toggleOff(id)) {
                        _setHotkeys(oldActionsLength);
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
