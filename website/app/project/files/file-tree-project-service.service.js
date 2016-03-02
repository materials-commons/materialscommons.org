(function(module) {
    module.factory('fileTreeProjectService', fileTreeProjectService);
    fileTreeProjectService.$inject = ['projectsAPI', 'gridFiles'];
    function fileTreeProjectService(projectsAPI, gridFiles) {
        return {
            getDirectory: function(projectID, directoryID) {
                return projectsAPI(projectID).one('directories', directoryID).get()
                    .then(function(files) {
                        return gridFiles.toGridChildren(files);
                    });
            },

            getProjectRoot: function(projectID) {
                return projectsAPI(projectID).one('directories').get()
                    .then(function(files) {
                        return gridFiles.toGrid(files);
                    });
            }
        };
    }
}(angular.module('materialscommons')));
