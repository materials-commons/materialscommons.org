Application.Services.factory("projectState", projectStateService);

// projectState service tracks state information by project. Each
// state has a unique id that is assigned to it.
function projectStateService() {
    var self = this;
    self.stateByProject = {};
    self.lastID = 0; // The last state id assigned.
    self.idPrefix = "STATE"; // Prefix this string for the state key id.

    // initForProject creates a new entry for project.
    self.initForProject = function(projectID) {
        self.stateByProject[projectID] = {};
    };

    // nextID creates a new unique id to use for this state.
    self.nextID = function() {
        self.lastID += 1;
        return self.idPrefix + self.lastID;
    };

    // getProjectStates returns the states for a project. If no entry
    // exists for that project then it creates one.
    self.getProjectStates = function(projectID) {
        if (!(projectID in self.stateByProject)) {
            self.initForProject(projectID);
        }

        return self.stateByProject[projectID];
    };

    return {
        // get returns the state for projectID/stateID. It returns
        // null if the stateID doesn't exist.
        get: function(projectID, stateID) {
            var projectStates = self.getProjectStates(projectID);
            if (!(stateID in projectStates)) {
                return null;
            }
            return projectStates[stateID];
        },

        // set will set the state id for a project to a new value. It
        // acts returns true if it was able to update the id, and false
        // if it couldn't find it.
        set: function(projectID, stateID, state) {
            var projectStates = self.getProjectStates(projectID);
            if (!(stateID in projectStates)) {
                return false;
            }
            projectStates[stateID] = state;
            return true;
        },

        // getset will attempt to retrieve the given state. If the given
        // state is null, then it will set it to the passed in state.
        getset: function(projectID, stateID, state) {
            var projectStates = self.getProjectStates(projectID);
            if (!(stateID in projectStates)) {
                projectStates[stateID] = state;
                return state;
            } else {
                var currentState = projectStates[stateID];
                if (currentState === null) {
                    projectStates[stateID] = state;
                    return state;
                }
                return currentState;
            }
        },

        // add adds a new state to a project. It returns its stateID.
        add: function(projectID, state) {
            var projectStates = self.getProjectStates(projectID);
            var stateID = self.nextID();
            var s = state ? state : null;
            projectStates[stateID] = s;
            return stateID;
        },

        // delete removes a given state from a project. It returns true
        // if the state was found, and false otherwise.
        delete: function(projectID, stateID) {
            var projectStates = self.getProjectStates(projectID);
            if (!(stateID in projectStates)) {
                return false;
            }

            delete projectStates[stateID];
            return true;
        }
    };
}
