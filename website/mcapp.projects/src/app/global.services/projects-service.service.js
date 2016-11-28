/*@ngInject*/
export function projectsService (Restangular) {
    var onChangeFn = null;
    var projectsAPI = _.partial(Restangular.one('v2').one, 'projects');

    return {

        getAllProjects: function() {
            return projectsAPI().getList();
        },

        getProject: function(projectId) {
            return projectsAPI(projectId).get();
        },

        createProject: function(projectName, projectDescription) {
            return Restangular.one('projects').customPOST({
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
            return projectsAPI(projectID).one('samples').getList();
        },

        getProjectSample: function(projectID, sampleID) {
            return Restangular.one('sample').one('details', sampleID).get()
                .then(function(samples) {
                    return samples[0];
                });
        },

        getProjectProcesses: function(projectID) {
            return projectsAPI(projectID).one('processes').getList();
        },

        getProjectProcess: function(projectId, processId) {
            return projectsAPI(projectId).one('processes', processId).get();
        },

        updateProjectProcess: function(projectID, process) {
            return projectsAPI(projectID).one('processes', process.id).customPUT(process).then(function(p) {
                if (onChangeFn) {
                    onChangeFn(p);
                }
                return p;
            });
        },

        updateProject: function(projectID, projectAttrs) {
            return projectsAPI(projectID).customPUT(projectAttrs);
        },

        createProjectProcess: function(projectID, process) {
            return projectsAPI(projectID).one('processes').customPOST(process).then(function(p) {
                if (onChangeFn) {
                    onChangeFn(p);
                }
                return p;
            });
        },

        getProjectDirectory: function(projectID, dirID) {
            if (!dirID) {
                return projectsAPI(projectID).one('directories').get();
            } else {
                return projectsAPI(projectID).one('directories', dirID).get();
            }
        },

        createProjectDir: function(projectID, fromDirID, path) {
            return projectsAPI(projectID).one('directories').customPOST({
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
            return projectsAPI(projectID).one('files', fileID).get();
        },

        onChange: function(scope, fn) {
            onChangeFn = fn;
            scope.$on('$destroy', function() {
                onChangeFn = null;
            });
        }
    }
}

