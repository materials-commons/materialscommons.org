angular.module('materialscommons').factory("project", projectService);

function projectService() {
    var self = this;
    self.project = {};
    self.onChangeFN = null;

    return {
        setOnChange(fn) {
            self.onChangeFN = fn;
        },

        set: function(proj) {
            self.project = proj;
            if (self.onChangeFN) {
                self.onChangeFN();
            }
        },

        get: function() {
            return self.project;
        }
    }
}
