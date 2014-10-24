Application.Services.factory("recent", ["$state", "$stateParams", recentService]);

// recent service tracks recently created items by project. It tracks
// their state information so that the window state can be recovered.
function recentService($state, $stateParams) {
    var self = this;
    self.recentByProject = {};
    self.lastsByProject = {};

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

    // getProjectLasts returns the last list for project. If no project
    // entry  exists then it creates an empty one.
    self.getProjectLasts = function(projectID) {
        if (!(projectID in self.lastsByProject)) {
            self.lastsByProject[projectID] = {
                items: [],
                ignorePush: false
            };
        }
        return self.lastsByProject[projectID];
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
            var routeParams = angular.copy($stateParams);
            item = self.newItem(name, stateID, route, routeParams);
            // Add to beginning of list so the most recently added items
            // are the first items.
            recents.unshift(item);
        },

        // addIfNotExists adds the state to a project only if
        // it doesn't exist.
        addIfNotExists: function(projectID, stateID, name) {
            if (!self.service.exists(projectID, stateID)) {
                self.service.add(projectID, stateID, name);
            }
        },

        // delete will remove a state from a project.
        delete: function(projectID, stateID) {
            var recents = self.getProjectRecents(projectID);
            var i = self.findRecent(projectID, stateID);
            if (i !== -1) {
                recents.splice(i, 1);
            }
        },

        // exists checks if a stateID is in a project.
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

        // pushLast adds a new last state to the list of lasts. If route
        // being pushed is an overview route then we pop all other routes
        // off the stack and add this one. This matches how the sidebar
        // works and keeps the stack from growing forever.
        pushLast: function(projectID, name, route, routeParams) {
            var lasts = self.getProjectLasts(projectID);
            var entryCount = lasts.items.length;
            if (lasts.ignorePush) {
                lasts.ignorePush = false;
                return;
            }
            if (_.str.include(route, "overview")) {
                lasts.items.splice(1, entryCount-1);
                lasts.items.push(self.newItem(name, "", route, routeParams));
            } else if ((route === "projects.project.home") && (entryCount > 1)) {
                // User clicked on home while in some sub state. Clear back to
                // home and don't save the previous route.
                lasts.items.splice(1, entryCount-1);
            } else {
                lasts.items.push(self.newItem(name, "", route, routeParams));
            }
        },

        // gotoLast will go to the last state and pops it off the stack.
        gotoLast: function(projectID) {
            var lasts = self.getProjectLasts(projectID);
            var entryCount = lasts.items.length;
            if (entryCount === 0) {
                // Nothing in list so just return.
                return;
            }
            // Lasts is a stack. We append to the array and remove from the back.
            var last = lasts.items[entryCount-1];
            lasts.items.splice(entryCount-1, 1); // Pop entry off
            lasts.ignorePush = true;
            $state.go(last.route, last.routeParams);
        },

        // resetLast will discard all state entries in the last stack.
        resetLast: function(projectID) {
            var lasts = self.getProjectLasts(projectID);
            lasts.items = [];
            lasts.ignorePush = false;
        }
    };

    return self.service;
}
