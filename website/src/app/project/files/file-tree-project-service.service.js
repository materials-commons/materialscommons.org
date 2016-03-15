angular.module('materialscommons').factory('fileTreeProjectService', fileTreeProjectService);
function fileTreeProjectService(projectsAPI, gridFiles) {
    'ngInject';

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

        createProjectDir: function(projectID, fromDirID, path) {
            return projectsAPI(projectID).one('directories').customPOST({
                from_dir: fromDirID,
                path: path
            }).then(function(dirs) {
                return dirs.dirs[0];
            });
        },

        renameProjectDir: function(projectID, dirID, newDirectoryName) {
            return projectsAPI(projectID).one('directories', dirID).customPUT({
                rename: {
                    new_name: newDirectoryName
                }
            });
        }
    };
}