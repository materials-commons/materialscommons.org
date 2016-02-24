(function(module) {
    module.factory('template', templateService);
    templateService.$inject = [];
    function templateService() {
        var self = this;
        self.template = {};

        return {
            set: function(template) {
                self.template = template;
            },

            get: function() {
                return self.template;
            }
        }
    }
}(angular.module('materialscommons')));
