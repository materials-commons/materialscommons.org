angular.module('materialscommons').factory("processEdit", processEdit);

function processEdit() {
    /**
     * fillSetUp: will read all the setup values from process
     * and place inside template.
     *
     */
    function setUp(template, process) {
        process.setup[0].properties.forEach(function(property) {
            var i = _.indexOf(template.setup[0].properties, function(template_property) {
                return template_property.property.attribute === property.attribute
            });
            if (i > -1) {
                template.setup[0].properties[i].property.value = property.value;
                template.setup[0].properties[i].property.name = property.name;
                template.setup[0].properties[i].property.description = property.description;
                template.setup[0].properties[i].property.unit = property.unit;
                template.setup[0].properties[i].property.id = property.id;
                template.setup[0].properties[i].property.setup_id = property.setup_id;
                template.setup[0].properties[i].property._type = property._type;
                template.setup[0].properties[i].property.attribute = property.attribute;

                // If selection type then modify the choices when Other is selected, since the
                // user may have modified the value of other. We need to do this otherwise the
                // default other in the choices will update the value and the user will lose what
                // they set.
                if (property._type === 'selection') {
                    if (property.value.name === 'Other') {
                        let otherChoicesIndex = _.indexOf(template.setup[0].properties[i].property.choices,
                            (c) => c.name === 'Other');
                        if (otherChoicesIndex !== -1) {
                            template.setup[0].properties[i].property.choices[otherChoicesIndex].value = property.value.value;
                        }
                    }
                }
            }
        });
        process.setup = template.setup;
        return process;
    }

    function samples(process) {
        //process.input_samples = process.input_samples;
        return process;
    }

    function files(process) {
        process['input_files'] = process.input_files.map(function(file) {
            return {id: file.id, name: file.name}
        });
        process['output_files'] = process.output_files.map(function(file) {
            return {id: file.id, name: file.name}
        });
        return process;
    }

    function addCompositionToMeasurements(prop, measurements) {
        for (let i = 0; i < measurements.length; i++) {
            let measurement = measurements[i];
            if (measurement.property.attribute === 'composition') {
                measurement.property.unit = prop.unit;
                measurement.property.value = prop.value;
                break;
            }
        }
    }

    function setupMeasurements(process, templateMeasurements, template) {
        if (template.category === 'create_samples') {
            // Hack, just extract the composition from one of the samples to display as the measurements.
            let foundComposition = false;
            for (let i = 0; i < process.input_samples.length; i++) {
                let sample = process.input_samples[i];
                for (let k = 0; k < sample.properties.length; k++) {
                    let prop = sample.properties[k];
                    if (prop.attribute === 'composition') {
                        addCompositionToMeasurements(prop.best_measure[0], templateMeasurements);
                        foundComposition = true;
                    }
                }
                if (foundComposition) {
                    break;
                }
            }
        }
        process.measurements = templateMeasurements;
    }

    return {
        fillProcess: function(template, process) {
            process = setUp(template, process);
            process = samples(process);
            process = files(process);
            setupMeasurements(process, template.measurements, template);
            if (!('output_samples' in process)) {
                process.output_samples = [];
            }
            if (!('transformed_samples' in process)) {
                process.transformed_samples = [];
            }
            return process;
        },

        addToSamplesFiles: function(files, process) {
            files.forEach(function(f) {
                var i = _.indexOf(process.samples_files, function(item) {
                    return f.id === item.id && f.sample_id == item.sample_id;
                });
                if (i !== -1) {
                    process.samples_files.splice(i, 1);
                    process.samples_files.push({
                        id: f.id,
                        command: f.command,
                        name: f.name,
                        sample_id: f.sample_id
                    });
                } else {
                    if (f.command) {
                        process.samples_files.push({
                            id: f.id,
                            command: f.command,
                            name: f.name,
                            sample_id: f.sample_id
                        });
                    }
                }
            });
            return process;
        },

        refreshSample: function(files, sample) {
            files.forEach(function(f) {
                if (f.command) {
                    var i = _.indexOf(sample.files, function(item) {
                        return f.id === item.id && f.sample_id == sample.id;
                    });
                    if (i !== -1) {
                        sample.files.splice(i, 1);
                        sample.files.push({
                            id: f.id,
                            command: f.command,
                            name: f.name,
                            sample_id: f.sample_id,
                            linked: f.linked
                        });
                    } else {
                        sample.files.push({
                            id: f.id,
                            command: f.command,
                            name: f.name,
                            sample_id: f.sample_id,
                            linked: f.linked
                        });
                    }
                }
            });
            return sample;
        }
    };
}