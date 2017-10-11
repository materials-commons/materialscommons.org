const Promise = require("bluebird");
const r = require('./r');

const backend_base = '../../..';
const mcapi_base = backend_base + '/servers/mcapi';

const db_model_base = mcapi_base + '/db/model'
const comments = require(db_model_base + '/comments');

let verbose = true;

function* notifyOtherUsers(owner, itemId) {
    return yield new Promise(function (resolve, reject) {
        console.log(comments);
//        let commentForItem = yield comments.getByItemId(itemId);
    });
}
