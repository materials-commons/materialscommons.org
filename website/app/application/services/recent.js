Application.Services.factory("recent", recentService);

// recent service tracks recently created items by project. It tracks
// their state information so that their window state can be recovered.
function recentService() {
    var self = this;
    self.recentByProject = {};

    self.initForProject = function(projectID) {
        self.recentByProject[projectID] = {
            items: []
        };
    };

    self.newItem = function(itemType, itemState, itemName, itemRoute) {
        return {
            itype: itemType,
            state: itemState,
            name: itemName,
            route: itemRoute
        };
    };

    self.itemEqual = function(item, name, itype, route) {
        return item.name == name && item.itype == itype && item.route == route;
    };

    return {
        // getRecent returns the list of recents for a project.
        getAll: function(projectID) {
            if (!(projectID in self.recentByProject)) {
                self.initForProject(projectID);
            }
            return self.recentByProject[projectID].items;
        },

        // updateRecent adds or updates an existing item in a project.
        update: function(projectID, name, itemType, state, route) {
            var item;
            var recents = self.recentByProject[projectID].items;
            var i = _.indexOf(recents, function(item) {
                return self.itemEqual(item, name, itemType, route);
            });

            if (i !== -1) {
                // Found existing, remove it from the list so we can add
                // it to the front. The list is not that large so while
                // this is an expensive operation, in a small list we
                // won't notice it. Also need to update it with its
                // new state.
                item = recents[i];
                item.state = state;
                recents.splice(i, 1);
                recents.unshift(item);
            } else {
                item = self.newItem(itemType, state, name, route);
                // Add to beginning of list so the most recently added items
                // are the first items.
                recents.unshift(item);
            }
        },

        icon: function(itemType) {
            switch (itemType) {
            case "process": return "fa-code-fork";
            case "sample": return "fa-cubes";
            case "note": return "fa-edit";
            case "file": return "fa-file";
            case "directory": return "fa-folder";
            case "review": return "fa-comment";
            default: return "";
            }
        }
    };
}
