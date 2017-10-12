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
    console.log("getAllForItem ", itemId);
    let comments = yield r.table("comments")
        .getAll(itemId,{index: 'item_id'});
    console.log("getAllForItem", comments);
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

module.exports = {
    get,
    getAllForItem,
    addComment
}