Application.Services.factory('Projects',
    [function () {
        var service = {
            model: {
                projects: {}
            },
            channel: null,

            clear: function () {
                service.model.projects = {};
            },

            setChannel: function (what) {
                service.channel = what;
            },

            clearSelectedFiles: function (projectId) {
                var treeModel = new TreeModel(),
                    root = treeModel.parse(service.model.projects[projectId].dir);
                root.walk({strategy: 'pre'}, function (node) {
                    node.model.selected = false;
                });
            },

            resetSelectedFiles: function(files, projectId) {
                var filesHash = {},
                    treeModel = new TreeModel(),
                    root = treeModel.parse(service.model.projects[projectId].dir);

                files.forEach(function(fileEntry) {
                    filesHash[fileEntry.id] = fileEntry;
                });

                root.walk({strategy: 'pre'}, function (node) {
                    if (filesHash.hasOwnProperty(node.model.id)) {
                        node.model.selected = true;
                    } else {
                        node.model.selected = false;
                    }
                });
            },

            setFilesSelected: function (files, projectId) {
                if (files.length == 0) {
                    return;
                }

                var filesHash = {},
                    treeModel = new TreeModel(),
                    root = treeModel.parse(service.model.projects[projectId].dir);

                files.forEach(function(fileEntry) {
                    filesHash[fileEntry.id] = fileEntry;
                });

                root.walk({strategy: 'pre'}, function (node) {
                    if (filesHash.hasOwnProperty(node.model.id)) {
                        node.model.selected = true;
                    }
                });
            }
        };
        return service;
    }]);
