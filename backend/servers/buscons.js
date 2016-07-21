var events = require('events');
var promise = require('bluebird');
var Bus = require('busmq');
var bus = Bus.create({redis: ['redis://localhost:6379']});



var q;

bus.on('online', function() {
    q = bus.queue('samples');
    q.attach();
    q.consume();
    q.on('message', function(message, id) {
        console.dir(message);
    });
});
bus.connect();
