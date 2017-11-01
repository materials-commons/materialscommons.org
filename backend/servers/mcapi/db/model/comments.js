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

function* addComment(user_id, attributes) {
    let owner = user_id;
    let item_id = attributes.item_id;
    let item_type = attributes.item_type;
    let text = attributes.text;
    let comment = yield db.insert('comments', new model.Comment(item_id, item_type, owner, text));
    let ret = {error: `could not add comment for item_id = ${item_id}`};
    if (comment) {
        ret = {val: comment};
    }
    return ret;
}

function* updateComment(id, attributes) {
    let text = attributes.text;
    let results = yield dbExec(r.table("comments").get(id).update({text: text}));
    if (results.replaced !== 1) {
        return {error: `updateComment - failed, ${id}`};
    }
    return yield get(id);
}

function* deleteComment(id) {
    let results = yield dbExec(r.table("comments").get(id).delete());
    if (results.deleted !== 1) {
        return {error: `updateComment - failed, ${id}`};
    }
    return {deleted: id}
}

module.exports = {
    get,
    getAllForItem,
    addComment,
    updateComment,
    deleteComment
}