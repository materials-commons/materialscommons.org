Application.Services.factory('actionStatus', ["pubsub", actionStatusService]);

function actionStatusService(pubsub) {
    var service = {
        actions: {},
        currentAction: {},
        currentActionsList: [
            "create-provenance-new",
            "create-provenance-from-draft",
            "create-review",
            "create-sample",
            "create-note"
        ],

        _newAction: function(name) {
            return {
                name: name,
                active: false,
                state: null
            };
        },

        addProject: function(project) {
            if (project in service.actions) {
                return;
            }
            service.currentAction[project] = "";
            service.actions[project] = {};
            service.currentActionsList.forEach(function(action) {
                service.actions[project][action] = service._newAction(action);
            });
        },

        fireAction: function(action) {
            pubsub.send(action);
        },

        onAction: function(scope, action, f) {
            pubsub.waitOn(scope, action, function() {
                f();
            });
        },

        isCurrentAction: function(project, action) {
            return service.currentAction[project] === action;
        },

        getCurrentActionState: function(project) {
            var action = service.currentAction[project];
            return service.actions[project][action].state;
        },

        setActionState: function(project, action, state) {
            service.actions[project][action].state = state;
        },

        setCurrentActionState: function(project, state) {
            var action = service.currentAction[project];
            service.setActionState(project, action, state);
        },

        clearActionState: function(project, action) {
            service.actions[project][action].state = null;
        },

        clearCurrentActionState: function(project) {
            var action = service.currentAction[project];
            service.clearActionState(project, action);
        },

        _setCurrentAction: function(project, action) {
            service.currentAction[project] = action;
        },

        toggleAction: function(project, action) {
            var setActionTo = action;
            if (service.isCurrentAction(project, action)) {
                setActionTo = "";
            }

            service._setCurrentAction(project, setActionTo);
            if (setActionTo !== "" && (!service.actions[project][action].active)) {
                service.actions[project][action].active = true;
            }
        },

        toggleCurrentAction: function(project) {
            var action = service.currentAction[project];
            service.toggleAction(project, action);
        },

        setActionInactive: function(project, action) {
            service.actions[project][action].active = false;
        },

        isActionActive: function(project, action) {
            return service.actions[project][action].active;
        }
    };

    return service;
}
