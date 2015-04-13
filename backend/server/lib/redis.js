var promise = require('bluebird');
var redis = require('redis');
var os = require('os');
var host = os.type() === 'Darwin' ? '192.168.59.103' : '127.0.0.1';
promise.promisifyAll(redis);
var client = redis.createClient(6379, host, {});

client.getJSONAsync = function (id) {
    return this.getAsync(id).then(function(value) {
        return JSON.parse(value);
    });
};

client.setJSONAsync = function(id, value) {
    'use strict';
    let str = JSON.stringify(value);
    return this.setAsync(id, str).then(function(v) {
        return v;
    });
};

client.mgetJSONAsync = function(ids) {
    'use strict';
    return this.mgetAsync(ids).then(function(values) {
        let containers = [];
        values.forEach(function(c) {
            containers.push(JSON.parse(c));
        });
        return containers;
    });
};

module.exports = client;
