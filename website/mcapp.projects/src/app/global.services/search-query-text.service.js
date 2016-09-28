angular.module('materialscommons').factory('searchQueryText', searchQueryTextService);

function searchQueryTextService() {
    var self = this;
    self.searchQuery = "";
    self.onChangeFN = null;

    return {
        setOnChange(fn) {
            self.onChangeFN = fn;
        },

        set: function(searchQuery) {
            self.searchQuery = searchQuery;
            if (self.onChangeFN) {
                self.onChangeFN();
            }
        },

        get: function() {
            return self.searchQuery;
        }
    }
}
