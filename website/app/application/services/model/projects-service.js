(function (module) {
    module.factory('model.projects',
        ["CachedServiceFactory",
            function (CachedServiceFactory) {
                var projectsService = new CachedServiceFactory("projects");
                return projectsService;
            }]);
}(angular.module('materialscommons')));
