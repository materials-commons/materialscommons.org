var getSingle = require('./get-single');
var promise = require('bluebird');
var _ = require('lodash');
var samples = require('./data').samples;

module.exports = {
    get: get,
    create: create,
    update: update
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
