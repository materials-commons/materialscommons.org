// Mocked Service
angular.module('mock.releases', []).factory('releaseService', function($q) {
    var releaseService = {};

    releaseService.getAll = function() {
        return [{DOI: "WXR123"}, {DOI: "ABC123"}, {DOI: "DEF456"}]
    };

    // example method that returns a promise, e.g. if original method returned $http.get(...)
    releaseService.fetch = function() {
        var mockRelease = {
            id: 8888,
            name: "test user"
        };
        return $q.when(mockRelease);
    };

    return releaseService;
});

