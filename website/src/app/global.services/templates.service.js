function templatesService($filter, processEdit) {
    'ngInject';

    var self = this;
    self.templates = {};

    function createName(templateName) {
        return templateName + ' - ' + $filter('date')(new Date(), 'MM/dd/yyyy @ h:mma');
    }

    function getTemplate(name) {
        var t = _.find(self.templates, {name: name});
        if (!t) {
            console.log('did not find template');
            return null;
        }
        var template = t.create();
        template.name = createName(template.name);
        return template;
    }

    return {
        set: function(templates) {
            self.templates = templates;
        },

        get: function() {
            return self.templates;
        },

        loadTemplateFromProcess(templateName, process) {
            var t = getTemplate(templateName);
            process.name = t.name;
            var p = processEdit.fillProcess(t, process);
            p.input_samples = [];
            p.input_files = [];
            p.output_files = [];
            return p;
        },

        getTemplate: getTemplate
    };
}

