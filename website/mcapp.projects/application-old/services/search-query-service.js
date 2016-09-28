(function (module) {
    module.factory("searchQuery", [searchQueryService]);

    // searchParams tracks params used in searches. This way
    // searches can be passed across different states and we
    // don't have to worry about trying to pass them in the url
    // or if we would need to escape the search string.
    function searchQueryService() {
        var self = this;
        self.searchById = {};

        // initForId creates a new entry in searchById.
        function initForId(id) {
            self.searchById[id] = {
                query: ""
            };
        }

        // getForId looks up an entry by id. If it doesn't exist
        // it creates an empty one, inserts it into searchById
        // and returns that entry.
        function getForId(id) {
            if (!(id in self.searchById)) {
                initForId(id);
            }
            return self.searchById[id];
        }

        self.service = {
            // set sets the search params for an id.
            set: function (id, query) {
                var entry = getForId(id);

                entry.query = query;
            },

            // get returns the search params for an id.
            get: function (id) {
                return getForId(id).query;
            },

            // clear is a convenience function to clear the
            // search params for an id.
            clear: function (id) {
                var entry = getForId(id);
                entry.query = "";
            }
        };

        return self.service;
    }
}(angular.module('materialscommons')));
