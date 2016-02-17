(function (module) {
    module.factory("project", projectService);
    projectService.$inject = [];

    function projectService() {
        var self = this;
        self.project = {};

        return {
            set: function(proj) {
                self.project = angular.copy(proj);
            },

            get: function() {
                return self.project;
            }
        }
    }
}(angular.module('materialscommons')));
