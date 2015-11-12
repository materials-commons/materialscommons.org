(function (module) {
    module.factory("processEdit", processEdit);
    processEdit.$inject = [];

    function processEdit() {
        var self = this;

        /**
         * fillSetUp: will read all the setup values from process
         * and place inside template.
         *
         */
        function setUp(template, process) {
            var settings = template.setup.settings[0].properties;
            process.setup[0].properties.forEach(function (property) {
                var i = _.indexOf(settings, function (setting) {
                    return setting.property.attribute === property.attribute
                });
                if (i > -1) {
                    settings[i].property.value = property.value;
                    settings[i].property.unit = property.unit;
                    settings[i].property.id = property.setup_id;
                    settings[i].property.property_id = property.id;
                    settings[i].property._type = property._type;
                    settings[i].property.attribute = property.attribute;
                }
            });
            process.setup = template.setup;
        }

        function samples(process) {
            process.input_samples = process.samples.map(function (sample) {
                return {
                    id: sample.id,
                    name: sample.name,
                    old_properties: [],
                    new_properties: [],
                    property_set_id: sample.property_set_id,
                    files: sample.linked_files
                }
            });
        }

        function files(process) {
            process['input_files'] = process.files_used.map(function (file) {
                return {id: file.id, name: file.name}
            });
            process['output_files'] = process.files_produced.map(function (file) {
                return {id: file.id, name: file.name}
            });
        }

        return {
            fillProcess: function (template, process) {
                setUp(template, process);
                samples(process);
                files(process);
            },

            addToProcess: function (files, process) {
                files.forEach(function (f) {
                    var i = _.indexOf(process.samples_files, function (item) {
                        return f.id === item.id;
                    });
                    if (i !== -1) {
                        process.samples_files.splice(i, 1);
                        process.samples_files.push({id: f.id, command: f.command, name: f.name});
                    } else {
                        if (f.command) {
                            process.samples_files.push({id: f.id, command: f.command, name: f.name});
                        }
                    }
                });
                return process;
            },

            addToSamples: function (files, sample) {
                files.forEach(function (f) {
                    if (f.command) {
                        var i = _.indexOf(sample.files, function (item) {
                            return f.id === item.id;
                        });
                        if (i !== -1) {
                            sample.files.splice(i, 1);
                            if(!(f.command === 'delete')){
                                sample.files.push({id: f.id, command: f.command, name: f.name, linked: f.linked});
                            }
                        } else {
                            if(!(f.command === 'delete')){
                                sample.files.push({id: f.id, command: f.command, name: f.name, linked: f.linked});
                            }
                        }
                    }
                });
                return sample;
            }
        };
    }
}(angular.module('materialscommons')));
