(function (module) {
    module.factory('projectsService', projectsService);
    projectsService.$inject = ["Restangular"];

    function projectsService(Restangular) {
        var onChangeFn = null;
        var projectsAPI = _.partial(Restangular.one('v2').one, 'projects');

        return {

            getProjectSamples: function (projectID) {
                return projectsAPI(projectID).one('samples').getList();
            },

            getProjectProcesses: function (projectID) {
                return projectsAPI(projectID).one('processes').getList();
            },

            updateProjectProcess: function (projectID, process) {
                return projectsAPI(projectID).one('processes', process.id).customPUT(process).then(function(p) {
                    if (onChangeFn) {
                        onChangeFn(p);
                    }
                    return p;
                });
            },

            createProjectProcess: function(projectID, process) {
                return projectsAPI(projectID).one('processes').customPOST(process).then(function(p) {
                    if (onChangeFn) {
                        onChangeFn(p);
                    }
                    return p;
                });
            },

            getProjectDirectory: function (projectID, dirID) {
                if (!dirID) {
                    return projectsAPI(projectID).one('directories').get();
                } else {
                    return projectsAPI(projectID).one('directories', dirID).get();
                }
            },

            createProjectDir: function (projectID, fromDirID, path) {
                return projectsAPI(projectID).one('directories').customPOST({
                    from_dir: fromDirID,
                    path: path
                }).then(function (dir) {
                    if (onChangeFn) {
                        onChangeFn(fromDirID, dir);
                    }
                    return dir;
                });
            },

            getProjectFile: function (projectID, fileID) {
                return projectsAPI(projectID).one('files', fileID).get();
            },

            onChange: function (scope, fn) {
                onChangeFn = fn;
                scope.$on('$destroy', function() {
                    onChangeFn = null;
                });
            }
        }
    }
}(angular.module('materialscommons')));
