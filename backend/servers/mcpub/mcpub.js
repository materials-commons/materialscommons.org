var cliArgs = require('command-line-args');
var koa = require('koa');
var router = require('koa-router')();
var datasets = require('./db/datasets');
var user = require('./db/user');
var action = require('./db/actions');
var appreciate = require('./db/appreciate');
var browse = require('./db/browse');
var view = require('./db/view');
var tag = require('./db/tag');
var comment = require('./db/comment');
var download = require('./db/download');
var path = require('path');
//var koaBody = require('koa-body')({
//    multipart: true,
//    formidable: {uploadDir: './../assets/user-images'},
//    keepExtensions: true
//});
var r = require('./dash');
var apikey = require('./apikey')();

// Look for changes on the users table. If a change it detected then invalidate
// the apikey cache so it will be reloaded.
const apikeyCache = require('./apikey-cache')();
r.db('materialscommons').table('users').changes().toStream().on('data', function() {
    apikeyCache.clear()
});

var app = koa();
app.use(apikey);
router.get('/datasets', datasets.getAll);
router.get('/datasets/count', datasets.getAllCount);
router.get('/datasets/recent', datasets.getRecent);
router.get('/datasets/views', datasets.getTopViews);
router.get('/datasets/:id', datasets.getOne);
router.get('/user/:email', user.get);
router.get('/actions/:dataset_id', action.getAll);
router.post('/appreciate', appreciate.addAppreciate);
router.put('/appreciate/remove', appreciate.removeAppreciation);
router.post('/views', view.addView);
router.post('/comments', comment.addComment);
router.post('/tags', tag.addTag);
router.put('/tags', tag.removeTag);
router.get('/tags', tag.getAllTags);
router.get('/tags/count', tag.getAllCount);
router.get('/tags/bycount', tag.getTagsByCount);
router.get('/tags/:id/datasets', tag.getDatasetsByTag);
router.get('/processes/types', browse.getProcessTypes);
router.get('/samples', browse.getSamples);
router.get('/authors/count', browse.getAllAuthorsCount);
router.get('/authors/datasets', browse.getAuthors);
//router.post('/upload', koaBody, user.upload);


app.use(router.routes());
app.use(router.allowedMethods());

if (!module.parent) {
    var cli = cliArgs([
        {name: 'port', type: Number, alias: 'p', description: 'Port to listen on'}
    ]);

    var options = cli.parse();
    var port = options.port || 5006;
    console.log('MCPUB listening on port: ' + port + ' pid: ' + process.pid);
    app.listen(port);
}

