var router = require('koa-router')();

function* allSamples(next) {
    yield next;
}

function *getSample(next) {
    yield next;
}
