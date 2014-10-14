Application.Services.factory("current", currentService);

function currentService() {
    var self = this;
    self.current = {
        project: null
    };

    return {
        projectID: function() {
            return self.current.project.id;
        },

        setProject: function(project) {
            self.current.project = project;
        }
    };
}
