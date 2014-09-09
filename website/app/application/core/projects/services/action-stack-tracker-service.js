Application.Services.factory('actionStackTracker', [actionStackTracker]);

function actionStackTracker(hotkeys, $location, $anchorScroll) {
    var service = {
        actions: [],

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
