var cliArgs = require('command-line-args');
var mount = require('koa-mount');
//var bodyParser = require('koa-bodyparser');
var koa = require('koa');
var app = module.exports = koa();
require('koa-qs')(app);
require('./init')();

var model = require('./model-loader')(module.parent);
var apikey = require('./apikey')(model.users);
var resources = require('./resources')(model);

app.use(apikey);
//app.use(bodyParser());
app.use(mount('/', resources.routes())).use(resources.allowedMethods());

// Look for changes on the access and projects tables. If a change is detected
// then invalidate the project access cache so that it will be reloaded.
const projectAccessCache = require('./resources/project-access-cache')(model.access);
model.r.table('access').changes().toStream().on('data', function() {
    projectAccessCache.clear();
});
model.r.table('projects').changes().toStream().on('data', function() {
    projectAccessCache.clear();
});

// Look for changes on the users table. If a change it detected then invalidate
// the apikey cache so it will be reloaded.
const apikeyCache = require('./apikey-cache')(model.users);
model.r.table('users').changes().toStream().on('data', function() {
    apikeyCache.clear()
});

var server = require('http').createServer(app.callback());
var io = require('socket.io')(server);

if (!module.parent) {
    var cli = cliArgs([
        {name: 'port', type: Number, alias: 'p', description: 'Port to listen on'}
    ]);

    var options = cli.parse();
    var port = options.port || 3000;
    //io.set('origins', `http://localhost:${port}`);
    io.on('connection', function(socket) {
        console.log('socket.io connection');
        socket.emit('event', {msg: 'you are connected'});
    });
    console.log('Listening on port: ' + port + ' pid: ' + process.pid);
    server.listen(port);
}

//////////////////////

// var Bus = require('busmq');
// var bus = Bus.create({redis: ['redis://localhost:6379']});
// var q;
// bus.on('online', function() {
//     q = bus.queue('samples');
//     q.attach();
// });
