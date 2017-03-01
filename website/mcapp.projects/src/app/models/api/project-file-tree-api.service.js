/*@ngInject*/
function ProjectFileTreeAPIService(projectsAPIRoute, gridFiles) {
    return {
        getDirectory: function(projectID, directoryID) {
            return projectsAPIRoute(projectID).one('directories', directoryID).get()
                .then(function(files) {
                    return gridFiles.toGridChildren(files);
                });
        },

        getProjectRoot: function(projectID) {
            return projectsAPIRoute(projectID).one('directories').get()
                .then(function(files) {
                    return gridFiles.toGrid(files);
                });
        },

        createProjectDir: function(projectID, fromDirID, path) {
            return projectsAPIRoute(projectID).one('directories').customPOST({
                from_dir: fromDirID,
                path: path
            }).then(function(dirs) {
                return dirs.dirs[0];
            });
        },

        renameProjectDir: function(projectID, dirID, newDirectoryName) {
            return projectsAPIRoute(projectID).one('directories', dirID).customPUT({
                rename: {
                    new_name: newDirectoryName
                }
            });
        },

        renameProjectFile: function(projectID, fileID, newFileName) {
            return projectsAPIRoute(projectID).one('files', fileID).customPUT({
                name: newFileName
            });
        }
    };
}

angular.module('materialscommons').factory('projectFileTreeAPI', ProjectFileTreeAPIService);