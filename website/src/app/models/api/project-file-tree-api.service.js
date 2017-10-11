/*@ngInject*/
function ProjectFileTreeAPIService(projectsAPIRoute, gridFiles) {
    return {
        getDirectory: function(projectID, directoryID) {
            return projectsAPIRoute(projectID).one('directories', directoryID).get()
                .then(function(files) {
                    let plainFiles = files.plain();
                    return gridFiles.toGridChildren(plainFiles);
                });
        },

        getProjectRoot: function(projectID) {
            return projectsAPIRoute(projectID).one('directories').get()
                .then(function(files) {
                    let plainFiles = files.plain();
                    return gridFiles.toGrid(plainFiles);
                });
        },

        createProjectDir: function(projectID, fromDirID, path) {
            return projectsAPIRoute(projectID).one('directories').customPOST({
                from_dir: fromDirID,
                path: path
            }).then(function(dirs) {
                let plainDirs = dirs.plain();
                return plainDirs.dirs[0];
            });
        },

        renameProjectDir: function(projectID, dirID, newDirectoryName) {
            return projectsAPIRoute(projectID).one('directories', dirID).customPUT({
                rename: {
                    new_name: newDirectoryName
                }
            }).then(dirs => dirs.plain());
        },

        renameProjectFile: function(projectID, fileID, newFileName) {
            return projectsAPIRoute(projectID).one('files', fileID).customPUT({
                name: newFileName
            }).then(f => f.plain());
        }
    };
}

angular.module('materialscommons').factory('projectFileTreeAPI', ProjectFileTreeAPIService);