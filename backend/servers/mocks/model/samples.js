var getSingle = require('./get-single');
var promise = require('bluebird');
var _ = require('lodash');
var samples = require('./data').samples;
var samples_attribute_set = require('./data').samples_attribute_set;

module.exports = {
    get: get,
    create: create,
    update: update,
    findInProject: findInProject,
    countAttributesInSample: countAttributesInSample,
    validateAttribute: validateAttribute,
    validateAttributeSet: validateAttributeSet,
    getMeasurements: getMeasurements,
    getAttributesFromAS: getAttributesFromAS
};

function get(id, index) {
    'use strict';

    return new Promise(function(resolve, reject) {
        let sample = getSingle(samples, id, index);
        resolve(sample);
    });
}

function create(sample) {
    return promise.resolve().then(function() {
        sample.id = sample.name;
        samples.push(sample);
        return sample;
    });
}

function update(id, fields) {
    'use strict';
    return promise.resolve().then(function() {
        let index = _.findIndex(samples, function(sample) {
            return sample.id == id;
        });
        if (index === -1) {
            return {};
        }
        for(let key in fields) {
            samples[index][key] = fields[key];
        }
        return samples[index];
    });
}

function findInProject(projectID, index, key) {
    'use strict';
    return promise.resolve().then(function() {
        let matching = _.filter(samples, function(sample){
            return sample.project_id === projectID && sample[index] === key;
        });
        return matching;
    });
}

function countAttributesInSample(asetID, attrIDs) {

}

function validateAttribute(sampleID, attrID) {
    'use strict';
    return promise.resolve().then(function() {
        let samples = _.filter(samples_attribute_set, function(item) {
            return item.sample_id === sampleID;
        });
        let attrs = [];
        samples.forEach(function(sample) {
            sample.attributes.forEach(function(attr) {
                if (attr.id === attrID) {
                    attrs.push(attr);
                }
            });
        });
        return attrs;
    });
}

function validateAttributeSet(sampleID, attrSetID) {
    'use strict';
    return promise.resolve().then(function() {
        let matches = _.filter(samples_attribute_set, function(item) {
            return item.sample_id == sampleID && item.attribute_set_id === attrSetID;
        });
        return matches;
    });
}

function getMeasurements(sampleID, measurements) {
    'use strict';
    return promise.resolve().then(function() {
        // find attribute sets for this sampleID
        let matches = _.filter(samples_attribute_set, function(item) {
            return item.sample_id === sampleID;
        });
        let measures = [];
        // for each matching attribute sets go through its attributes
        matches.forEach(function(attrSet) {
            attrSet.attributes.forEach(function(attr) {
                // for each attribute go through its measurements and
                // check if any of those measurements ids are in the
                // list of measurements we were passed. If we find a
                // match append the measurement to measures.
                attr.measurements.forEach(function(m) {
                    let index = _.findIndex(measurements, function(id) {
                        return id === m.id;
                    });
                    if (index !== -1) {
                        measures.push(m);
                    }
                });
            });
        });
        return measures;
    });
}

function getAttributesFromAS(asetID, attrs) {
    'use strict';
    return promise.resolve().then(function() {
        // find attribute sets matching asetID
        let matches = _.filter(samples_attribute_set, function(item) {
            return item.attribute_set_id === asetID;
        });
        let attributes = [];
        // for each attribute set go through the list of attributes,
        // and see if that attribute is in the list of attrs. If it
        // is then append it to attributes.
        matches.forEach(function(attrSet) {
            attrSet.attributes.forEach(function(attr) {
                let index = _.findIndex(attrs, function(id) {
                    return id === attr.id;
                });
                if (index !== -1) {
                    attributes.push(attr);
                }
            });
        });
        return attributes;
    });
}
