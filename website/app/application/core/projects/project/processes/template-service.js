Application.Services.factory('Template',
    [function () {
        var service = {
            activeTemplate: {},

            getActiveTemplate: function () {
                return service.activeTemplate;
            },
            setActiveTemplate: function (template) {
                service.activeTemplate = template;
            }
        };
        return service;
    }]);
