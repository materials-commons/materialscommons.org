angular.module('materialscommons').factory("project", projectService);

function projectService() {
    var self = this;
    self.project = {};

    return {
        set: function(proj) {
            self.project = proj;
        },

        get: function() {
            return self.project;
        }
    }
}
