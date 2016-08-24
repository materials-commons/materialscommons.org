export function templatesService($filter, processEdit, $log) {
    'ngInject';

    var self = this;
    self.templates = {};

    function createName(templateName) {
        return templateName + ' - ' + $filter('date')(new Date(), 'MM/dd/yyyy @ h:mma');
    }

    function getTemplate(name) {
        var t = _.find(self.templates, {name: name});
        if (!t) {
            $log.log('did not find template');
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
            if (process.input_samples) {
                p.input_samples = process.input_samples;
            } else {
                p.input_samples = [];
            }

            if (process.output_samples) {
                p.output_samples = process.output_samples;
            } else {
                p.output_samples = [];
            }

            if (process.input_files) {
                p.input_files = process.input_files;
            } else {
                p.input_files = [];
            }

            if (process.output_files) {
                p.output_files = process.output_files;
            } else {
                p.output_files = [];
            }
            return p;
        },

        getTemplate: getTemplate,

        loadProcess(process) {
            let templateName = process.process_name ? process.process_name : process.template_id.substring(7);
            var t = getTemplate(templateName);
            return processEdit.fillProcess(t, process);
        }
    };
}

