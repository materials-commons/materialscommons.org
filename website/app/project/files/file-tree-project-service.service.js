(function(module) {
    module.factory('fileTreeProjectService', fileTreeProjectService);
    fileTreeProjectService.$inject = ['projectsAPI', 'gridFiles'];
    function fileTreeProjectService(projectsAPI, gridFiles) {
        return {
            moveFile: function(projectID, fileID, oldDirID, newDirID) {
                var moveArgs = {
                    move: {
                        old_directory_id: oldDirID,
                        new_directory_id: newDirID
                    }
                };
                return projectsAPI(projectID).one('files', fileID).customPUT(moveArgs);
            },

            moveDir: function(projectID, dirID, newDirID) {
                var moveArgs = {
                    move: {
                        new_directory_id: newDirID
                    }
                };
                return projectsAPI(projectID).one('directories', dirID).customPUT(moveArgs);
            },

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
        }
    }
}(angular.module('materialscommons')));
