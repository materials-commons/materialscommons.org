var getSingle = require('./get-single');

module.exports = {
    get: get
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
