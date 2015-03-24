var mount = require('koa-mount');
var router = require('koa-router')();
var koa = require('koa');
var Bus = require('busmq');
var app = koa();
require('koa-qs')(app);
var ropts = {
    db: 'materialscommons',
    port: 30815
};
var r = require('rethinkdbdash')(ropts);
var projectsModel = require('./model/db/projects')(r);
var projects = require('./resources/projects')(projectsModel);

var bus = Bus.create({redis: ['redis://localhost:6379']});

var q;

bus.on('online', function() {
    q = bus.queue('samples');
    q.attach();
});

function* samples(next) {
    yield next;
    this.body = {samples:['a', 'b']};
}

var router2 = require('koa-router')();
router2.get('/samples', samples);

var apikey = require('./apikey');

app.use(apikey(r));
app.use(mount('/', projects.routes())).use(projects.allowedMethods());
app.use(mount('/', router2.routes()));
app.listen(3000);
