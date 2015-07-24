/*
 * The Projects service acts as a cache for projects and their files. It provides routines
 * for manipulating the selected flag in the list of files in a project, as well as channel
 * that controllers, directives and services can set to receive events on.
 */
Application.Services.factory('projectFiles', projectFilesService);
function projectFilesService() {
    var service = {
        model: {
            projects: {}
        },
        activeByProject: {},
        activeFile: null,
        activeDirectory: {},

        isActive: function (projectID) {
            if (!(projectID in service.activeByProject)) {
                service.activeByProject[projectID] = false;
            }

            return service.activeByProject[projectID];
        },

        /*
         * Clears the current set of projects.
         */
        clear: function () {
            service.model.projects = {};
        },

        // Sets up a list of files by mediatype. The type "all" is used to
        // list all files in a project.
        loadByMediaType: function (project) {
            service.model.projects[project.id].byMediaType = {};
            var byMediaType = service.model.projects[project.id].byMediaType;
            byMediaType.all = [];
            for (var mediatype in project.mediatypes) {
                byMediaType[mediatype] = [];
            }
            byMediaType.unknown = [];
            var treeModel = new TreeModel(),
                root = treeModel.parse(service.model.projects[project.id].dir);
            root.walk({strategy: 'pre'}, function(node) {
                if (node.model.type !== "datadir") {
                    node.model.showDetails = false;
                    byMediaType.all.push(node.model);
                    if (node.model.mediatype === "") {
                        byMediaType.unknown.push(node.model);
                    } else if (!(node.model.mediatype in byMediaType)) {
                        byMediaType[node.model.mediatype] = [];
                         byMediaType[node.model.mediatype] = [];
                        byMediaType[node.model.mediatype].push(node.model);
                    } else {
                        byMediaType[node.model.mediatype].push(node.model);
                    }
                }
            });
        },

        findFileByID: function(projectID, fileID) {
            var f = null;
            var treeModel = new TreeModel(),
                root = treeModel.parse(service.model.projects[projectID].dir);
            root.walk({strategy: 'pre'}, function(node) {
                if (node.model.df_id == fileID) {
                    f = node.model;
                }
            });
            return f;
        },

        setActiveFile: function (what) {
            service.activeFile = what;
        },

        getActiveFile: function () {
            return service.activeFile;
        },

        setActiveDirectory: function (what) {
            service.activeDirectory = what;
        },

        getActiveDirectory: function () {
            return service.activeDirectory;
        }
    };
    return service;
}
