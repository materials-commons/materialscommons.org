const cliArgs = require('command-line-args');
const koa = require('koa');
const router = require('koa-router')();
const datasets = require('./db/datasets');
const user = require('./db/user');
const action = require('./db/actions');
const appreciate = require('./db/appreciate');
const browse = require('./db/browse');
const view = require('./db/view');
const tag = require('./db/tag');
const comment = require('./db/comment');
const download = require('./db/download');
const path = require('path');
//var koaBody = require('koa-body')({
//    multipart: true,
//    formidable: {uploadDir: './../assets/user-images'},
//    keepExtensions: true
//});
const r = require('./dash');
const apikey = require('./apikey')();

// Look for changes on the users table. If a change it detected then invalidate
// the apikey cache so it will be reloaded.
const apikeyCache = require('./apikey-cache')();
r.db('materialscommons').table('users').changes().toStream().on('data', function() {
    apikeyCache.clear()
});

const app = koa();
app.use(apikey);
router.get('/datasets', datasets.getAll);
router.get('/datasets/:id', datasets.getOne);
router.get('/datasets/:id/processes/:process_id', datasets.getDatasetProcess);
router.get('/datasets/filter/count/', datasets.getAllCount);
router.get('/datasets/filter/recent', datasets.getRecent);
router.get('/datasets/filter/views', datasets.getTopViews);
router.get('/datasets/download/:id', datasets.getZipfile);
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
router.get('/tags/popular', tag.getMostPopularTags);
router.get('/tags/:id/datasets', tag.getDatasetsByTag);
router.get('/processes/types', browse.getProcessTypes);
router.get('/samples', browse.getSamples);
router.get('/authors/count', browse.getAllAuthorsCount);
router.get('/authors/datasets', browse.getAuthors);
//router.post('/upload', koaBody, user.upload);


app.use(router.routes());
app.use(router.allowedMethods());

if (!module.parent) {
    const optionsDef = [
        {name: 'port', type: Number, alias: 'p', description: 'Port to listen on'}
    ];
    const options = cliArgs(optionsDef);
    const port = options.port || 5006;
    console.log('MCPUB listening on port: ' + port + ' pid: ' + process.pid);
    app.listen(port);
}

