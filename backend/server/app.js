var mount = require('koa-mount');
var router = require('koa-router')();
var koa = require('koa');
var app = module.exports = koa();
require('koa-qs')(app);
require('./init')();

var model = require('./model-loader')(module.parent);
var schema = require('./schema')(model);
var projects = require('./resources/projects-routes')(model.projects);
var samples = require('./resources/samples-routes')(model.samples, schema);
var keycache = require('./apikey-cache')(model.users);
var apikey = require('./apikey')(keycache);

app.use(apikey); // Check for valid apikey on all routes after this line

app.use(mount('/', projects.routes())).use(projects.allowedMethods());
app.use(mount('/', samples.routes())).use(samples.allowedMethods());

if (!module.parent) {
    app.listen(3000);
}


//////////////////////

// var Bus = require('busmq');
// var bus = Bus.create({redis: ['redis://localhost:6379']});
// var q;
// bus.on('online', function() {
//     q = bus.queue('samples');
//     q.attach();
// });
