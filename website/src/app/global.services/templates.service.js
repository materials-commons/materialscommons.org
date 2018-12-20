/*@ngInject*/
function templatesService(Restangular, $log) {

    const self = this;
    self.templates = {};

    // defined but not used
    //function createName(templateName) {
    //    return templateName + ' - ' + $filter('date')(new Date(), 'MM/dd/yyyy @ h:mma');
    //}

    function getTemplate(name) {
        let t = _.find(self.templates, {name: name});
        if (!t) {
            $log.log('did not find template');
            return null;
        }
        return angular.copy(t);
    }

    return {
        set: function(templates) {
            self.templates = templates;
        },

        get: function() {
            return self.templates;
        },

        loadTemplateFromProcess(templateName, process) {
            let t = getTemplate(templateName);
            process.name = t.name;
            let p = process;
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

        getServerTemplates() {
            return Restangular.one('v2').one('/templates').get().then(t => t.plain());
        }
    };
}

angular.module('materialscommons').factory("templates", templatesService);

