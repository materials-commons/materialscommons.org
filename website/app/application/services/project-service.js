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
            }
        };
        return service;
    }]);
