const r = require('actionhero').api.r;
const dbExec = require('./run');
const model = require('./model');
const db = require('./db');


async function getList(projectID, userID) {
    let rql = r.table('user2share').getAll(userID, {index: 'user_id'})
        .eqJoin('share_id', r.table('shares')).zip().filter({project_id: projectID})
        .without('user_id', 'project_id', 'share_id')
        .group('item_type').ungroup().map(function(row) {
            return {
                item_type: row('group'),
                items: row('reduction')
            }
        });
    let items = await dbExec(rql);
    return {val: items};
}

async function create(projectID, share) {
    let s = new model.Share(projectID, share.item_id, share.item_type, share.item_name);
    let createdShare = await db.insert('shares', s);
    let users2Add = share.users.map(u => new model.User2Share(u, createdShare.id));
    await db.insert('user2share', users2Add);
    return createdShare;
}

async function remove(userID, shareID) {
    await r.table('users2share').getAll([userID, shareID], {index: 'user_share'}).delete();
    let remaining = await r.table('users2share').getAll(shareID, {index: 'share_id'});
    if (!remaining.length) {
        // No users left for this share, delete it
        await r.table('shares').get(shareID).delete();
    }
    return {val: true};
}

module.exports = {
    getList: getList,
    create: create,
    remove: remove
};