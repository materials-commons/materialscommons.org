Application.Services.factory('actionStackTracker', ["hotkeys", "$location", "$anchorScroll", actionStackTracker]);

function actionStackTracker(hotkeys, $location, $anchorScroll) {
    var service = {
        actions: [],

        _createHotkey: function(key, id, title) {
            hotkeys.add({
                combo: '' + key,
                description: title,
                callback: function() {
                    $location.hash(id);
                    $anchorScroll();
                }
            });
        },

        _setHotkeys: function(oldlength) {
            var i = 0;
            for (i = 0; i < oldlength; i++) {
                if (i > 8) {
                    break;
                }
                hotkeys.del('' + (i + 1));
            }
            for(i = 0; i < service.actions.length; i++) {
                if (i > 8) {
                    break;
                }
                service._createHotkey(i+1, service.actions[i].id, service.actions[i].title);
            }
        },

        _newAction: function(actionID, actionTitle) {
            var title = actionTitle ? actionTitle : actionID;
            return {
                id: actionID,
                title: title,
                status: "open",
                pinned: false
            };
        },

        _findAction: function(actionID) {
            return _.indexOf(service.actions, function(action) {
                return action.id == actionID;
            });
        },

        actionActive: function(actionID) {
            var i = _.find(service.actions, function(action) {
                return action.id == actionID;
            });
            return i;
        },

        popAction: function(actionID) {
            var i = service._findAction(actionID);
            if (i != 1) {
                service.actions.splice(i, 1);
            }
        },

        pushAction: function(actionID, actionTitle) {
            var oldlength = service.actions.length;
            service.actions.push(service._newAction(actionID, actionTitle));
            service._setHotkeys(oldlength);
        },

        toggleAction: function(actionID) {
            var i = service._findAction(actionID);

            // If found then the action is open.
            if (i != -1) {
                if (!service.actions[i].pinned) {
                    service.actions.splice(i, 1);
                }
            }
        },

        toggleOff: function(actionID) {
            var i = service._findAction(actionID);
            if (i != -1) {
                if (!service.actions[i].pinned) {
                    var oldlength = service.actions.length;
                    service.actions.splice(i, 1);
                    service._setHotkeys(oldlength);
                    return true;
                }
            }
            return false;
        },

        _setPin: function(actionID, toval) {
            var i = service._findAction(actionID);
            if (i != -1) {
                service.actions[i].pinned = toval;
            }
        },

        pinAction: function(actionID) {
            service._setPin(actionID, true);
        },

        unpinAction: function(actionID) {
            service._setPin(actionID, false);
        }
    };

    return service;
}
