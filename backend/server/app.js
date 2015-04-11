var mount = require('koa-mount');
var koa = require('koa');
var app = module.exports = koa();
require('koa-qs')(app);
require('./init')();

var model = require('./model-loader')(module.parent);
var apikey = require('./apikey')(model.users);
var projects = require('./resources/projects-routes')(model);

var loginRoute = require('koa-router')();
loginRoute.get('/login', function *login(next) {
    this.body = "login";
    this.status = 200;
    yield next;
});

app.use(apikey);
app.use(mount('/', loginRoute.routes())).use(loginRoute.allowedMethods());
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
