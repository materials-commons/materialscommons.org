/*@ngInject*/
function ProjectFileTreeAPIService(projectsAPIRoute, gridFiles, Restangular, User, toast) {
    return {

        getDirectoryForProject(directoryId, projectId) {
            return Restangular.one('v3').one('getDirectoryForProject').customPOST({
                project_id: projectId,
                directory_id: directoryId
            }).then(
                results => results.plain().data,
                e => toast.error(e.data.error)
            );
        },

        getDirectoryByPathForProject(path, projectId) {
            return Restangular.one('v3').one('getDirectoryByPathForProject').customPOST({
                project_id: projectId,
                directory_path: path,
            }).then(
                results => results.plain().data,
                e => toast.error(e.data.error)
            );
        },

        createDirectoryInProject(path, parentId, projectId) {
            return Restangular.one('v3').one('createDirectoryInProject').customPOST({
                project_id: projectId,
                parent_directory_id: parentId,
                path: path,
                return_parent: true,
            }).then(
                results => results.plain().data,
                e => toast.error(e.data.error)
            );
        },

        downloadProjectFiles: function(fileIds) {
            return Restangular.one('project2').one('archive').customPOST({
                file_ids: fileIds
            }).then(
                resp => `api/project2/download/archive/${resp.archive_id}.zip?apikey=${User.apikey()}`
            );
        },

        renameFileInProject: function(fileId, projectId, newName) {
            return Restangular.one('v3').one('renameFileInProject').customPOST({
                project_id: projectId,
                file_id: fileId,
                name: newName,
            }).then(
                f => f.plain().data,
                e => e.data.error,
            );
        },

        // ==================================================

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
        },
    };
}

angular.module('materialscommons').factory('projectFileTreeAPI', ProjectFileTreeAPIService);