Application.Services.factory('Template',
    ["processTemplates" , function (processTemplates) {
        var service = {
            activeTemplate: {},

            getActiveTemplate: function () {
                return service.activeTemplate;
            },
            setActiveTemplate: function (template) {
                service.activeTemplate = processTemplates.newInstance(template);
            }
        };
        return service;
    }]);
