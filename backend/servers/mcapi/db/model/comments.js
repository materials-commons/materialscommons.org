const r = require('../r');
const dbExec = require('./run');
const db = require('./db');
const model = require('./model');

function* get(id) {
    let comment = yield dbExec(r.table("comments").get(id));
    let ret = {error: `comment not found for id = ${id}`};
    if (comment)
        return {val: comment};
    return ret;
}

function* getAllForItem(itemId) {
    let comments = yield r.table("comments")
        .getAll(itemId,{index: 'item_id'});
    return {val: comments};
}

function* addComment(item_id, item_type, owner, text) {
    let comment = yield db.insert('comments', new model.Comment(item_id, item_type, owner, text));
    let ret = {error: `could not add comment for item_id = ${item_id}`};
    if (comment) {
        ret = {val: comment};
    }
    return ret;
}

function* updateComment(id, text) {
    let results = yield dbExec(r.table("comments").get(id).update(comment));
    if (results.replaced !== 1) {
        console.log(`updateComment - failed, ${id}`);
        return {error: `updateComment - failed, ${id}`};
    }
    console.log(`updateComment - success, ${id}`)
    return {val: yield get(id)};
}

function* deleteComment(id) {
    let results = yield dbExec(r.table("comments").get(id).delete());

}

module.exports = {
    get,
    getAllForItem,
    addComment,
    updateComment,
    deleteComment
}