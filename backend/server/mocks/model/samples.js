var getSingle = require('./get-single');
var promise = require('bluebird');

module.exports = {
    get: get,
    create: create
};

var samples = [
    {
        id: 'sample1',
        name: 'sample1'
    },
    {
        id: 'sample2',
        name: 'sample2'
    }
];

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
