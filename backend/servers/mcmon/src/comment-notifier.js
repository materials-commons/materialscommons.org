const r = require('./r');

const Promise = require('bluebird');

const commentsDatabase = require('../../mcapi/db/model/comments');
const usersDatabase = require('../../mcapi/db/model/users');
const mailer = require('./comment-mailer')

function notifyOtherUsers (comment, verbose=false, supressSending=false) {
    Promise.coroutine(promiseNotify)(comment, verbose, supressSending)
}

function* promiseNotify(comment, verbose, supressSending) {
    let tracer = comment.id.substring(0,5);
    let otherAuthors = yield * getOtherUsersFor(comment);
    commentAuthor = yield * usersDatabase.getUserExternal(comment.owner);
    let objectName = yield * itemNameFrom(comment);
    for (let i = 0; i < otherAuthors.length; i++ ) {
        let user = otherAuthors[i];
        mailer.mailCommentNotification(user, comment, objectName, commentAuthor, otherAuthors, verbose, supressSending);
    }
}

function* getOtherUsersFor (comment) {
    let valComments = yield * commentsDatabase.getAllForItem(comment.item_id);
    allComments = valComments.val;
    let matchedUsers = [];

    allComments.forEach((probe) => {
        if (probe.owner !== comment.owner) {
            if (matchedUsers.indexOf(probe.owner) === -1) {
                matchedUsers.push(probe.owner);
            }
        }
    });

    for (let i = 0; i < matchedUsers.length; i++) {
        let id = matchedUsers[i];
        let user = yield * usersDatabase.getUserExternal(id);
        matchedUsers[i] = user;
    }

    return matchedUsers;
}

function* itemNameFrom(comment){
    let id = comment.item_id;
    let type = comment.item_type;
    let name = "Item of unknow type with id=" + id;
    if (type) {
        name = type + " with id=" + id;
        let table = typeToTable(type);
        if (table) {
            let ret = yield r.table(table).get(id).pluck('name');
            if (ret) {
                name = ret.name;
            }
        }
    }
    return name;
}


const typeToTableMap = {
    'project' : 'projects',
    'experiment' : 'experiments',
    'process' : 'processes',
    'sample' : 'samples',
    'dataset' : 'datasets',
    'datadir' : 'datadirs',
    'datafile' : 'datafiles',
    'template' : 'templates'
}

function typeToTable(type) {
    return typeToTableMap[type];
}

module.exports = {
    notifyOtherUsers
};

