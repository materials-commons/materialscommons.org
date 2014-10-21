Application.Services.factory("recent", ["$state", recentService]);

// recent service tracks recently created items by project. It tracks
// their state information so that the window state can be recovered.
function recentService($state) {
    var self = this;
    self.recentByProject = {};
    self.last = {};

    // initForProject create a new project entry in the recents list.
    self.initForProject = function(projectID) {
        self.recentByProject[projectID] = {
            items: []
        };
    };

    // icon will translate a route to an icon.
    self.icon = function(route) {
        var routeType = route.replace("projects.project.", "");
        var n = routeType.indexOf(".");
        if (n !== -1) {
            routeType = routeType.slice(0, n);
        }
        switch (routeType) {
        case "provenance": return "fa-code-fork";
        case "samples": return "fa-cubes";
        case "notes": return "fa-edit";
        case "files": return "fa-file";
        case "reviews": return "fa-comment";
        case "home": return "fa-home";
        default: return "";
        }
    };

    // newItem creates a new recent item.
    self.newItem = function(name, stateID, route, routeParams) {
        return {
            id: stateID,
            icon: self.icon(route),
            name: name,
            route: route,
            routeParams: routeParams
        };
    };

    // getProjectRecents returns the recent items for project. If no project
    // entry exists then it creates an empty one.
    self.getProjectRecents = function(projectID) {
        if (!(projectID in self.recentByProject)) {
            self.initForProject(projectID);
        }
        return self.recentByProject[projectID].items;
    };

    // findRecent looks for the recentID in the named project. It
    // returns the index in the projects recents list. It returns
    // -1 if the recent wasn't found.
    self.findRecent = function(projectID, recentID) {
        var recents = self.getProjectRecents(projectID);
        var i = _.indexOf(recents, function(item) {
            return item.id === recentID;
        });
        return i;
    };

    self.service = {
        // getRecent returns the list of recents for a project.
        getAll: function(projectID) {
            return self.getProjectRecents(projectID);
        },

        // updateRecent updates an existing recent in a project. Returns true
        // if it found the item to update, and false otherwise.
        update: function(projectID, id, name) {
            var recents = self.getProjectRecents(projectID);
            var i = self.findRecent(projectID, id);

            if (i !== -1) {
                var item = recents[i];
                item.name = name;
                return true;
            }
            return false;
        },

        // add creates a new recent entry, prepends it to the list of recents.
        add: function(projectID, stateID, name) {
            var recents = self.getProjectRecents(projectID);
            var route = $state.$current.name;
            var routeParams = $state.$current.params;
            item = self.newItem(name, stateID, route, routeParams);
            // Add to beginning of list so the most recently added items
            // are the first items.
            recents.unshift(item);
        },

        addIfNotExists: function(projectID, stateID, name) {
            if (!self.service.exists(projectID, stateID)) {
                self.service.add(projectID, stateID, name);
            }
        },

        delete: function(projectID, stateID) {
            var recents = self.getProjectRecents(projectID);
            var i = self.findRecent(projectID, stateID);
            if (i !== -1) {
                recents.splice(i, 1);
            }
        },

        exists: function(projectID, stateID) {
            var recents = self.getProjectRecents(projectID);
            var i = self.findRecent(projectID, stateID);
            return i !== -1;
        },

        // gotoRecent changes the state to the recent identified. This will update
        // the users page view. It moves this recent to the first item in the list.
        gotoRecent: function(projectID, recentID) {
            var recents = self.getProjectRecents(projectID);
            var i = self.findRecent(projectID, recentID);
            if (i !== -1) {
                // This item becomes the most recent item, so it moves
                // to the top.
                var item = recents[i];
                recents.splice(i, 1);
                recents.unshift(item);
                $state.go(item.route, item.routeParams);
            }
        },

        // setLast sets the last state for the project.
        setLast: function(projectID, name, route, routeParams) {
            self.last[projectID] = self.newItem(name, "", route, routeParams);
        },

        // getLast returns the last state we were in.
        getLast: function(projectID) {
            if (!(projectID in self.last)) {
                return null;
            }
            return self.last[projectID];
        },

        // gotoLast will go to the last state.
        gotoLast: function(projectID) {
            if (!(projectID in self.last)) {
                return;
            }
            var last = self.last[projectID];
            $state.go(last.route, last.routeParams);
        }
    };

    return self.service;
}
