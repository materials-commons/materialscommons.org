(function (module) {
    module.factory("listParams", [listParamsService]);

// listParams tracks params used to list a set of items. This way
// lists can be passed across different states and we
// don't have to worry about trying to pass them in the url
// or if we would need to escape the list filter string.
    function listParamsService() {
        var self = this;
        self.filterById = {};

        // initForId creates a new entry in filterById.
        function initForId(id) {
            self.filterById[id] = {
                filter: "",
                key: "",
                description: ""
            };
        }

        // getForId looks up an entry by id. If it doesn't exist
        // it creates an empty one, inserts it into filterById
        // and returns that entry.
        function getForId(id) {
            if (!(id in self.filterById)) {
                initForId(id);
            }
            return self.filterById[id];
        }

        self.service = {
            // set sets the filter params for an id.
            set: function (id, key, filter, description) {
                var entry = getForId(id);
                entry.key = key;
                entry.filter = filter;
                entry.description = description;
            },

            // get returns the filter params for an id.
            get: function (id) {
                return getForId(id);
            },

            // clear is a convenience function to clear the
            // filter params for an id.
            clear: function (id) {
                var entry = getForId(id);
                entry.filter = "";
                entry.key = "";
                entry.description = "";
            }
        };

        return self.service;
    }
}(angular.module('materialscommons')));
