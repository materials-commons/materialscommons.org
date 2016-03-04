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
            },

            createProjectDir: function (projectID, fromDirID, path) {
                return projectsAPI(projectID).one('directories').customPOST({
                    from_dir: fromDirID,
                    path: path
                }).then(function (dirs) {
                    return dirs.dirs[0];
                });
            }
        };
    }
}(angular.module('materialscommons')));
