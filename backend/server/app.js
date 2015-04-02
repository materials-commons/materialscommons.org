var mount = require('koa-mount');
var router = require('koa-router')();
var koa = require('koa');
var app = module.exports = koa();
require('koa-qs')(app);
require('./init')();

var model = require('./model-loader')(module.parent);
var apikey = require('./apikey')(model.users);
var projects = require('./resources/projects-routes')(model);

router.get('/login', function *login(next) {
    console.log("calling login");
    this.unprotected = true;
    this.body = "login";
    this.status = 200;
    yield next;
});

app.use(mount('/', router.routes())).use(router.allowedMethods());
app.use(apikey); // Check for valid apikey on all routes after this line
//app.use(projectCtx);
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
