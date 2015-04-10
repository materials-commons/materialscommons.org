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
    validateAttributeSet: validateAttributeSet
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
        let index = _.indexOf(samples, function(sample) {
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
