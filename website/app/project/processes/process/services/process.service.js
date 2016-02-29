(function(module) {
    module.factory('process', processService);
    processService.$inject = [];
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
}(angular.module('materialscommons')));

