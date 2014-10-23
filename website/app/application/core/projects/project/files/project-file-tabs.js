Application.Services.factory('projectFileTabs', projectFileTabsService);

// projectFileTabs tracks the open files to display in the files.overview for a project.
function projectFileTabsService() {
    var self = this;
    self.fileTabsByProject = {};

    // initForProject initializes a project entry.
    self.initForProject = function(projectID) {
        self.fileTabsByProject[projectID] = [];
    };

    // getProjectFileTabs gets the file tabs for a project. If there
    // is no project entry it initializes an empty one.
    self.getProjectFileTabs = function(projectID) {
        if (!(projectID in self.fileTabsByProject)) {
            self.initForProject(projectID);
        }
        return self.fileTabsByProject[projectID];
    };

    // findFile finds the matching file entry by comparing ids.
    self.findFile = function(fielTabs, file) {
        var i = _.indexOf(fileTabs, function(f) {
            return f.id === file.id;
        });
        return i;
    };

    self.service = {
        // get returns the list of file tabs for a project.
        get: function(projectID) {
            return self.getProjectFileTabs(projectID);
        },

        // add appends a new file to the list. It ignores duplicates.
        add: function(projectID, file) {
            var fileTabs = self.getProjectFileTabs(projectID);
            if (self.findFile(fileTabs, file) !== -1) {
                return;
            }
            fileTabs.push(file);
        },

        // delete removes an existing file entry from the list.
        delete: function(projectID, file) {
            var fileTabs = self.getProjectFileTabs(projectID);
            var i = self.findFile(fileTabs, file);
            if (i !== -1) {
                fileTabs.splice(i, 1);
            }
        }
    };

    return self.service;
}
