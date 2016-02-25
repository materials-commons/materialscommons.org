(function(module) {
    module.factory("templates", templatesService);
    templatesService.$inject = ['$filter'];

    function templatesService($filter) {
        var self = this;
        self.templates = {};

        function createName(templateName) {
            return templateName + ' - ' + $filter('date')(new Date(), 'MM/dd/yyyy @ h:mma');
        }

        return {
            set: function(templates) {
                self.templates = templates;
            },

            get: function() {
                return self.templates;
            },

            getTemplate: function(name) {
                console.log('getTemplate:', name);
                var t = _.find(self.templates, {name: name});
                if (!t) {
                    console.log('did not find template');
                    return null;
                }
                var template = t.create();
                template.name = createName(template.name);
                return template;
            }
        };
    }
}(angular.module('materialscommons')));
