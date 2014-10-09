Application.Services.factor('ui', uiService);

function uiService() {
    var self = this;
    self.showByProject = {};

    self.initForProject = function(projectID) {
        self.showByProject[projectID] = {
            toolbarTabs: true,
            files: true
        };
    };

    return {
        showFiles: function(projectID) {
            if (!(projectID in self.showByProject)) {
                self.initForProject(projectID);
            }

            return self.showByProject[projectID].files;
        },

        showToolbarTabs: function(projectID) {
            if (!(projectID in self.showByProject)) {
                self.initForProject(projectID);
            }

            return self.showByProject[projectID].toolbarTabs;
        },

        setShowFiles: function(projectID, what) {
            self.showByProject[projectID].files = what;
        },

        setShowToolbarTabs: function(projectID, what) {
            self.showByProject[projectID].toolbarTabs = what;
        }
    };
}
