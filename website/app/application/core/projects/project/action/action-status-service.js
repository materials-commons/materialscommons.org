Application.Services.factory('actionStatus', actionStatusService);

function actionStatusService() {
    var service = {
        actions: {},
        currentAction: {},
        currentActionsList: [
            "create-provenance",
            "create-review",
            "create-sample",
            "create-note"
        ],

        _newAction: function(name) {
            return {
                name: name,
                active: false
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

        isCurrentAction: function(project, action) {
            return service.currentAction[project] === action;
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

        setActionInactive: function(project, action) {
            service.actions[project][action].active = false;
        },

        isActionActive: function(project, action) {
            return service.actions[project][action].active;
        }
    };

    return service;
}
