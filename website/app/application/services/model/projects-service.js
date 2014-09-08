Application.Services.factory('model.projects',
    ["CachedServiceFactory",
        function (CachedServiceFactory) {
            var projectsService = new CachedServiceFactory("projects");
            return projectsService;
        }]);
