Application.Services.factory("breadcrumbs", [breadcrumbsService]);

function breadcrumbsService() {
    var self = this;
    self.pathByProject = {};

    self.initForProject = function(projectID, projectName) {
        if (!(projectID in self.pathByProject)) {
            self.pathByProject[projectID] = [];
            self.pathByProject[projectID].push(projectName);
        }
    };

    self.service = {
        // createProject creates a new project entry. If the
        // project already exists it doesn't do anything.
        createProject: function(projectID, projectName) {
            self.initForProject(projectID, projectName);
        },

        // get returns the paths for the project.
        get: function(projectID) {
            return self.pathByProject[projectID];
        },

        // clearFrom will clear all elements after from.
        clearFrom: function(projectID, from) {
            var i = _.indexOf(self.pathByProject[projectID], function(entry) {
                return entry === from;
            });

            if (i !== -1) {
                self.pathByProject.splice(i+1);
            }
        },

        // append adds a new element to the end of the path
        append: function(projectID, element) {
            self.pathByProject.push(element);
        },

        // clear clears the entries except for the first one which is
        // presumed to be the project name.
        clear: function(projectID) {
            self.pathByProject.splice(1);
        }
    };

    return self.service;
}
