const _ = require('lodash');

function mergeTemplateIntoProcess(template, process) {
    for (let pindex = 0; pindex < process.setup.length; pindex++) {
        let setup = process.setup[pindex];
        if (setup.attribute === 'instrument') {
            setup.properties.forEach(function(property) {
                let i = _.findIndex(template.setup[0].properties, (tprop) => tprop.attribute === property.attribute);
                if (i > -1) {
                    template.setup[0].properties[i].value = property.value;
                    template.setup[0].properties[i].name = property.name;
                    template.setup[0].properties[i].description = property.description;
                    template.setup[0].properties[i].unit = property.unit;
                    template.setup[0].properties[i].id = property.id;
                    template.setup[0].properties[i].setup_id = property.setup_id;
                    template.setup[0].properties[i].otype = property.otype;
                    template.setup[0].properties[i].attribute = property.attribute;

                    // If selection type then modify the choices when Other is selected, since the
                    // user may have modified the value of other. We need to do this otherwise the
                    // default other in the choices will update the value and the user will lose what
                    // they set.
                    if (property.otype === 'selection') {
                        if (property.value && (property.value.name === 'Other')) {
                            let otherChoicesIndex = _.findIndex(template.setup[0].properties[i].choices, (c) => c.name === 'Other');
                            if (otherChoicesIndex !== -1) {
                                template.setup[0].properties[i].choices[otherChoicesIndex].value = property.value.value;
                            }
                        }
                    }
                }
            });
            process.setup[pindex] = template.setup[0];
        }
    }
    if (!process.measurements.length && template.measurements.length) {
        process.measurements = template.measurements;
    }
    return process;
}

function convertDatePropertyAttributes(process) {
    if (process.setup) {
        let setup = process.setup;
        for (let i = 0; i < setup.length; i++) {
            let s = setup[i];
            if (s.properties) {
                let properties = s.properties;
                for (let j = 0; j < properties.length; j++) {
                    let property = properties[j];
                    if (property.otype && (property.otype === 'date')) {
                        let value = property.value;
                        if (value && value.epoch_time) {
                            let date = new Date(1000 * value.epoch_time);
                            property.value = date.getTime();
                        }
                    }
                }
            }
        }
    }
    return process;
}

module.exports = {
    mergeTemplateIntoProcess,
    convertDatePropertyAttributes,
};