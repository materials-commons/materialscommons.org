/*@ngInject*/
function ProjectFileTreeAPIService(projectsAPIRoute, gridFiles, Restangular, User) {
    return {

        getDirectoryForProject: function(projectId, dirId) {
            return Restangular.one('v4').one('ui').one('getDirectoryForProject')
                .customPOST({project_id: projectId, directory_id: dirId}).then(dirs => dirs.plain());
        },

        getFilesForDirectory: function(projectId, dirId) {
            return Restangular.one('v4').one('ui').one('getFilesForDirectory')
                .customPOST({project_id: projectId, directory_id: dirId}).then(files => files.plain());
        },

        //

        getDirectory: function (projectID, directoryID) {
            return projectsAPIRoute(projectID).one('directories', directoryID).get()
                .then(function (files) {
                    let plainFiles = files.plain();
                    return gridFiles.toGridChildren(plainFiles);
                });
        },

        getProjectRoot: function (projectID) {
            return projectsAPIRoute(projectID).one('directories').get()
                .then(function (files) {
                    let plainFiles = files.plain();
                    return gridFiles.toGrid(plainFiles);
                });
        },

        createProjectDir: function (projectID, fromDirID, path) {
            return projectsAPIRoute(projectID).one('directories').customPOST({
                from_dir: fromDirID,
                path: path
            }).then(function (dirs) {
                let plainDirs = dirs.plain();
                return plainDirs.dirs[0];
            });
        },

        renameProjectDir: function (projectID, dirID, newDirectoryName) {
            return projectsAPIRoute(projectID).one('directories', dirID).customPUT({
                rename: {
                    new_name: newDirectoryName
                }
            }).then(dirs => dirs.plain());
        },

        renameProjectFile: function (projectID, fileID, newFileName) {
            return projectsAPIRoute(projectID).one('files', fileID).customPUT({
                name: newFileName
            }).then(f => f.plain());
        },

        downloadProjectFiles: function (fileIds) {
            return Restangular.one("project2").one("archive").customPOST({
                file_ids: fileIds
            }).then(
                resp => `api/project2/download/archive/${resp.archive_id}.zip?apikey=${User.apikey()}`
            );
        }
    };
}

angular.module('materialscommons').factory('projectFileTreeAPI', ProjectFileTreeAPIService);