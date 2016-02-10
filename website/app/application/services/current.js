(function (module) {
    module.factory("current", currentService);

    function currentService() {
        var self = this;
        self.current = {
            project: null,
            process: null
        };

        return {
            projectID: function () {
                return self.current.project.id;
            },

            project: function () {
                return self.current.project;
            },

            setProject: function (project) {
                self.current.project = project;
            },

            process: function() {
                return self.current.process;
            }
        };
    }
}(angular.module('materialscommons')));
