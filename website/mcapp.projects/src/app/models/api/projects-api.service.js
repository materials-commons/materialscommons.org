/*@ngInject*/
function projectsAPIService(Restangular) {
    let onChangeFn = null;
    const projectsAPIRoute = _.partial(Restangular.one('v2').one, 'projects');

    return {

        getAllProjects: function() {
            return projectsAPIRoute().getList();
        },

        getProject: function(projectId) {
            return projectsAPIRoute(projectId).get();
        },

        createProject: function(projectName, projectDescription) {
            return Restangular.one('v2').one('projects').customPOST({
                name: projectName,
                description: projectDescription
            }).then(function(p) {
                if (onChangeFn) {
                    onChangeFn(p);
                }
                return p;
            })
        },

        getProjectSamples: function(projectID) {
            return projectsAPIRoute(projectID).one('samples').getList();
        },

        getProjectSample: function(projectID, sampleID) {
            return Restangular.one('sample').one('details', sampleID).get()
                .then(function(samples) {
                    return samples[0];
                });
        },

        getProjectProcesses: function(projectID) {
            return projectsAPIRoute(projectID).one('processes').getList();
        },

        getProjectProcess: function(projectId, processId) {
            return projectsAPIRoute(projectId).one('processes', processId).get();
        },

        updateProjectProcess: function(projectID, process) {
            return projectsAPIRoute(projectID).one('processes', process.id).customPUT(process).then(function(p) {
                if (onChangeFn) {
                    onChangeFn(p);
                }
                return p;
            });
        },

        updateProject: function(projectID, projectAttrs) {
            return projectsAPIRoute(projectID).customPUT(projectAttrs);
        },

        createProjectProcess: function(projectID, process) {
            return projectsAPIRoute(projectID).one('processes').customPOST(process).then(function(p) {
                if (onChangeFn) {
                    onChangeFn(p);
                }
                return p;
            });
        },

        getProjectDirectory: function(projectID, dirID) {
            if (!dirID) {
                return projectsAPIRoute(projectID).one('directories').get();
            } else {
                return projectsAPIRoute(projectID).one('directories', dirID).get();
            }
        },

        getAllProjectDirectories: function(projectId) {
            return projectsAPIRoute(projectId).one('directories', 'all').getList();
        },

        createProjectDir: function(projectID, fromDirID, path) {
            return projectsAPIRoute(projectID).one('directories').customPOST({
                from_dir: fromDirID,
                path: path
            }).then(function(dirs) {
                if (onChangeFn) {
                    onChangeFn(fromDirID, dirs);
                }
                return dirs;
            });
        },

        getProjectFile: function(projectID, fileID) {
            return projectsAPIRoute(projectID).one('files', fileID).get();
        },

        onChange: function(scope, fn) {
            onChangeFn = fn;
            scope.$on('$destroy', function() {
                onChangeFn = null;
            });
        }
    }
}

angular.module('materialscommons').factory('projectsAPI', projectsAPIService);

