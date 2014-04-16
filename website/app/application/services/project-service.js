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

            clearSelectedFiles: function(projectId) {
                var treeModel = new TreeModel(),
                    root = treeModel.parse(service.model.projects[projectId].dir);
                root.walk({strategy: 'pre'}, function (node) {
                    node.model.selected = false;
                });
            }
        };
        return service;
    }]);
