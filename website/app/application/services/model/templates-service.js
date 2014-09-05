Application.Services.factory('model.templates',
    ["CachedServiceFactory",
        function (CachedServiceFactory) {
            var templatesService = new CachedServiceFactory("/templates");
            return templatesService;
        }]);
