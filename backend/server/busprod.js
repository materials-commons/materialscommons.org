var Bus = require('busmq');
var bus = Bus.create({redis: ['redis://localhost:6379']});

var q;

bus.on('online', function() {
    q = bus.queue('samples');
    q.attach();
    q.push({hello: 'world'});
});

bus.connect();
