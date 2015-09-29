(function (module) {
    module.factory("processEdit", ["processList", "processTemplates", "$q", processEdit]);

    function processEdit(processList, processTemplates, $q) {
        var self = this;

        return {

            transformSetup: function (process_id) {
                console.log('inside edit service');
                var q = $q.defer();
                self.process = processList.getProcess($stateParams.process_id, processes);
                q.resolve(self.process);
                self.template = processTemplates.getTemplateByName(process.template_name);
                q.resolve(self.template);
                process.setup[0].properties.forEach(function (property) {
                    var i = _.indexOf(template.setup.settings[0].properties, function(template_property) {
                        return template_property.property.name === property.name;
                    });

                    if (i > -1) {
                        template.setup.settings[0].properties[i].property.value = property.value;
                        template.setup.settings[0].properties[i].property.unit = property.unit;
                        template.setup.settings[0].properties[i].property.id = property.id;
                    }
                })
                q.resolve(template);
                return q.promise;
            }
        };
    }
}(angular.module('materialscommons')));
