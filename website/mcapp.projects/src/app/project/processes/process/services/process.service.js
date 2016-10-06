angular.module('materialscommons').factory('process', processService);
function processService() {
    var self = this;
    self.process = {};

    return {
        set: function(process) {
            self.process = process;
        },

        get: function() {
            return self.process;
        }
    }
}
