var mount = require('koa-mount');
var router = require('koa-router')();
var koa = require('koa');
var Bus = require('busmq');
var app = koa();
require('koa-qs')(app);

var bus = Bus.create({redis: ['redis://localhost:6379']});

var q;

bus.on('online', function() {
    q = bus.queue('samples');
    q.attach();
});

function* projects(next) {
    yield next;
    this.body = {projects: ['a', 'b']};
}

function* project(next) {
    console.log(this.params.id);
    console.log(this.query);
    yield next;
    this.body = {name: 'project1'};
}

router.get('/projects', projects);
router.get('/projects/:id', project);

function* samples(next) {
    yield next;
    this.body = {samples:['a', 'b']};
}

var router2 = require('koa-router')();
router2.get('/samples', samples);

app.use(mount('/', router.routes()));
app.use(mount('/', router2.routes()));
app.listen(3000);
