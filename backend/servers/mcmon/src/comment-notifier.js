const r = require('./r');

const Promise = require('bluebird');

const commentsDatabase = require('../../mcapi/db/model/comments');
const usersDatabase = require('../../mcapi/db/model/users');
const mailer = require('./comment-mailer')

let verbose = true;

function notifyOtherUsers (comment) {
    console.log("notifyOtherUsers - start")
    Promise.coroutine(promiseNotify)(comment)
        .then(() => {
            console.log("notifyOtherUsers - done");
        });
    console.log("notifyOtherUsers - return")
}

function* promiseNotify(comment) {
    console.log("promiseNotify start", comment.id);
    let otherUsers = yield * getOtherUsersFor(comment);
    console.log("promiseNotify - otherUsers count = ", otherUsers.length);
    commentAuthor = yield * usersDatabase.getUserExternal(comment.owner);
    notifyTextList = yield * composeMessage(comment, commentAuthor, otherUsers);
    for (let i = 0; i < otherUsers.length; i++ ) {
        let user = otherUsers[i];

        yield * notify(user, notifyTextList);
    }
    console.log("promiseNotify done ", comment.id);
}

function* getOtherUsersFor (comment) {
    console.log("getOtherUsersFor", comment.id);

    let valComments = yield * commentsDatabase.getAllForItem(comment.item_id);
    allComments = valComments.val;
    console.log("got comments: ", allComments.length);

    let matchedUsers = [];
    allComments.forEach((probe) => {
        if (probe.owner !== comment.owner) {
            console.log("Not Match: ", probe.owner, comment.owner);

            if (! (probe.owner in matchedUsers)) {
                console.log("Add ", probe.owner);

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

function* composeMessage(comment, author, others){
    let type = comment.item_type;
    let name = yield * itemNameFrom(comment);
    let text = comment.text;
    let authorName = makeNameForUser(author);
    let othersNames = makeNameLineForOthers(others);
    let message = ['Notification of comment in Materials Commons: ',
        'Comment by ' + authorName + " on this object: name = '" + name + "' of type = '" + type + "'",
        'Comment: ' + comment.text,
        'Other comments by: ' + othersNames,
         '(Note: you received this notification because you previously made a comment on this object)'];
    return message;
}

function makeNameForUser(user) {
    let name = user.fullname;
    if (!name) name = user.id
    if (name !== user.id) {
        name = name + " (" + user.id + ")"
    }
    return name;
}

function makeNameLineForOthers(others) {
    let names = [];
    for (let i = 0; i < others.length; i++) {
        names.push(makeNameForUser(others[i]));
    }
    return names.join(", ");
}

function* itemNameFrom(comment){
    let id = comment.item_id;
    let type = comment.item_type;
    let name = "Item of unknow type with id=" + id;
    if (type) {
        name = type + " with id=" + id;
        let table = typeToTable(type);
        if (table) {
            let ret = yield * r.table(table).get(id).pluck('name');
            if (ret) {
                name = ret;
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

function* notify(user, text) {
    mailer.mailCommentNotification(user,text);
}

module.exports = {
    notifyOtherUsers
};

