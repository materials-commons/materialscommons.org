(function (module) {
    module.factory('model.projects',
        ["CachedServiceFactory",
            function (CachedServiceFactory) {
                return new CachedServiceFactory("projects");
            }]);
}(angular.module('materialscommons')));
