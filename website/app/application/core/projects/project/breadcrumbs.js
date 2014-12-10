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

    self.routeMap = {
        "projects.project.home": ["Home"],
        "projects.project.samples": ["Samples"],
        "projects.project.samples.overview": ["Samples"],
        "projects.project.samples.create": ["Samples", "New"],
        "projects.project.tasks": ["Tasks"],
        "projects.project.tasks.overview": ["Tasks"],
        "projects.project.tasks.create": ["Tasks", "New"],
        "projects.project.provenance": ["Provenance"],
        "projects.project.provenance.overview": ["Provenance"],
        "projects.project.provenance.create": ["Provenance", "New"],
        "projects.project.provenance.drafts": ["Provenance", "Drafts"],
        "projects.project.reviews": ["Reviews"],
        "projects.project.reviews.overview": ["Reviews"],
        "projects.project.reviews.create": ["Reviews", "New"],
        "projects.project.reviews.edit": ["Reviews", "Edit"],
        "projects.project.notes": ["Notes"],
        "projects.project.notes.overview": ["Notes"],
        "projects.project.notes.edit": ["Notes", "Edit"],
        "projects.project.notes.create": ["Notes", "New"],
        "projects.project.files": ["Files"],
        "projects.project.files.overview": ["Files"],
        "projects.project.files.view": ["Files", "View"],
        "projects.project.files.list": ["Files", "List"],
        "projects.project.tags": ["Tags"],
        "projects.project.tags.create": ["Tags", "New"]
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
                if (i >= self.pathByProject[projectID].length) {
                    // if we found the last element to clear, then
                    // ignore otherwise the whole array will be cleared.
                    // This is a safety check that allows the user to
                    // clear from a name that is the last element and not
                    // corrupt what is expected.
                    return;
                }
                self.pathByProject[projectID].splice(i+1);
            }
        },

        // append adds a new element to the end of the path
        append: function(projectID, element) {
            self.pathByProject[projectID].push(element);
        },

        // clear clears the entries except for the first one which is
        // presumed to be the project name.
        clear: function(projectID) {
            if (self.pathByProject[projectID].length > 1) {
                self.pathByProject[projectID].splice(1);
            }
        },

        fromRoute: function(projectID, route) {
            self.service.clear(projectID);
            var entries = self.routeMap[route];
            if (!entries) {
                return;
            }
            entries.forEach(function(entry) {
                self.service.append(projectID, entry);
            });
        }
    };

    return self.service;
}
