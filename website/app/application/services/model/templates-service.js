Application.Services.factory('model.Templates',
    ["CachedServiceFactory",
        function (CachedServiceFactory) {
            var templatesService = new CachedServiceFactory("/templates");
            return templatesService;
        }]);