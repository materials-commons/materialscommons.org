(function (module) {
    module.factory("applySearch", ["watcher", "$debounce", applySearchService]);
    function applySearchService(watcher, $debounce) {
        function applySearch(scope, variable, fn) {
            watcher.watch(scope, variable, function (s) {
                $debounce(fn, 350);
            });
        }

        return applySearch;
    }
}(angular.module('materialscommons')));
