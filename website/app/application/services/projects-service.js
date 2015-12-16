(function (module) {
    module.factory('projectsService', projectsService);
    projectsService.$inject = ["Restangular"];

    function projectsService(Restangular) {
        var onChangeFn = null;
        var projectsAPI = _.partial(Restangular.one('v2').one, 'projects');

        return {
            getProject: function (projectID) {

            },

            getProjectSamples: function (projectID) {
                return projectsAPI(projectID).one('samples').getList();
            },

            getProjectProcesses: function (projectID) {
                return projectsAPI(projectID).one('processes').getList();
            },

            getProjectDirectory: function (projectID, dirID) {
                if (!dirID) {
                    return projectsAPI(projectID).one('directories').get();
                } else {
                    return projectsAPI(projectID).one('directories', dirID).get();
                }
            },

            getProjectFile: function (projectID, fileID) {
                return projectsAPI(projectID).one('files', fileID).get();
            },

            createProjectDir: function (projectID, fromDirID, path) {
                return projectsAPI(projectID).one('directories').customPOST({
                    from_dir: fromDirID,
                    path: path
                }).then(function(dir) {
                    onChangeFn(fromDirID, dir);
                    return dir;
                });
            },

            onChange: function (fn) {
                onChangeFn = fn;
            }
        }
    }
}(angular.module('materialscommons')));
