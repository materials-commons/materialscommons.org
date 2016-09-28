angular.module('materialscommons').factory('sharedProjectsList', sharedProjectsListService);

function sharedProjectsListService() {
    var self = this;
    self.sharedProjects = [];
    self.maxProjects = 3;

    return {
        setMaxProjects: function(maxProjects) {
            self.maxProjects = maxProjects;
        },

        addProject: function(project) {
            if (self.sharedProjects.length < self.maxProjects) {
                self.sharedProjects.push(project);
                return true;
            }

            return false;
        },

        isFull: function() {
            return self.sharedProjects.length === self.maxProjects;
        },

        clearSharedProjects: function() {
            self.sharedProjects.length = 0;
        },

        count: function() {
            return self.sharedProjects.length;
        },

        removeProject: function(project) {
            var index = _.findIndex(self.sharedProjects, {id: project.id});
            if (index !== -1) {
                self.sharedProjects.splice(index, 1);
                return true;
            }
            return false;
        },

        removeLast: function() {
            if (!self.sharedProjects.length) {
                return null;
            }
            var index = self.sharedProjects.length - 1;
            var removed = self.sharedProjects.splice(index, 1);
            return removed[0];
        },

        get: function() {
            return self.sharedProjects;
        }
    }
}