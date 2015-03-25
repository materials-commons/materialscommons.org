var mount = require('koa-mount');
var router = require('koa-router')();
var koa = require('koa');
var app = module.exports = koa();
require('koa-qs')(app);

var model = require('./model-loader')(module.parent);
var projects = require('./resources/projects-routes')(model.projects);
var keycache = require('./apikey-cache')(model.users);
var apikey = require('./apikey')(keycache);

app.use(apikey); // This checks for valid apikey on all routes after this

app.use(mount('/', projects.routes())).use(projects.allowedMethods());

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
