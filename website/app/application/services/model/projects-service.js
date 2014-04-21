Application.Services.factory('model.Projects',
    ["CachedServiceFactory",
        function (CachedServiceFactory) {
            var projectsService = new CachedServiceFactory("projects/by_group");
            return projectsService;
        }]);