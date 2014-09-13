Application.Services.factory("actionStack",
                             ["$rootScope", "actionStackTracker", "$compile", "hotkeys",
                              "$location", "$anchorScroll", actionStackService]);
function actionStackService($rootScope, actionStackTracker, $compile, hotkeys, $location, $anchorScroll) {
    var service = {

        _createHotkey: function (key, id, title) {
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

        },

        _setHotkeys: function(oldlength) {
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
                service._createHotkey(i+1, actions[i].id, actions[i].title);
            }
        },

        toggleStackAction: function(action, title, useID, args) {
            var id = useID ? useID : action;
            var actionDirective = "<div action-" + action + "></div>";
            var actionTitle = title ? title : id;
            var oldActionsLength = actionStackTracker.actions.length;
            var scope = $rootScope.$new(true);

            if (args) {
                actionDirective = "<div action-" + action + " args='" + JSON.stringify(args) + "'></div>";
            }

            var t = '<div style="margin-bottom: 25px;" ui-draggable="false" id="' + id + '" class="row col-lg-12"><a name="' + id + '"></a><hr class="carved"/>';
            t = t + '<div><div class="col-lg-offset-5"><h4>' + actionTitle + '</h4></div>' + actionDirective + '</div></div>';

            if (!actionStackTracker.actionActive(id)) {
                actionStackTracker.pushAction(id, title);
                service._setHotkeys(oldActionsLength);
                $('#action-stack').append($compile(t)(scope));
                $location.hash(id);
                $anchorScroll();
            } else if (actionStackTracker.toggleOff(id)) {
                service._setHotkeys(oldActionsLength);
                $("#" + id).remove();
            }
        },

        isActionActive: function(action, useID) {
            var id = useID ? useID : 'action-' + action;
            return actionStackTracker.actionActive(id);
        }
    };

    return service;
}
