Application.Services.factory('ui', uiService);

function uiService() {
    var self = this;
    self.showByProject = {};

    self.initForProject = function(projectID) {
        self.showByProject[projectID] = {
            files: false
        };
    };

    return {
        showFiles: function(projectID) {
            if (!(projectID in self.showByProject)) {
                self.initForProject(projectID);
            }

            return self.showByProject[projectID].files;
        },

        setShowFiles: function(projectID, what) {
            if (!(projectID in self.showByProject)) {
                self.initForProject(projectID);
            }
            self.showByProject[projectID].files = what;
        }
    };
}
