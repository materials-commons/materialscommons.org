Application.Services.factory('actionStackTracker', [actionStackTracker]);

function actionStackTracker() {
    var service = {
        actions: [],

        _newAction: function(actionName) {
            return {
                name: actionName,
                status: "open",
                pinned: false
            };
        },

        _findAction: function(actionName) {
            return _.indexOf(service.actions, function(action) {
                return action.name == actionName;
            });
        },

        actionActive: function(actionName) {
            var i = _.find(service.actions, function(action) {
                return action.name == actionName;
            });
            return i;
        },

        popAction: function(actionName) {
            var i = service._findAction(actionName);
            if (i != 1) {
                service.actions.splice(i, 1);
            }
        },

        pushAction: function(actionName) {
            service.actions.push(service._newAction(actionName));
        },

        toggleAction: function(actionName) {
            var i = service._findAction(actionName);

            // If found then the action is open.
            if (i != -1) {
                if (!service.actions[i].pinned) {
                    service.actions.splice(i, 1);
                }
            }
        },

        toggleOff: function(actionName) {
            var i = service._findAction(actionName);
            if (i != -1) {
                if (!service.actions[i].pinned) {
                    service.actions.splice(i, 1);
                    return true;
                }
            }
            return false;
        },

        _setPin: function(actionName, toval) {
            var i = service._findAction(actionName);
            if (i != -1) {
                service.actions[i].pinned = toval;
            }
        },

        pinAction: function(actionName) {
            service._setPin(actionName, true);
        },

        unpinAction: function(actionName) {
            service._setPin(actionName, false);
        }
    };

    return service;
}
