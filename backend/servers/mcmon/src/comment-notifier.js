const r = require('./r');

const Promise = require('bluebird');

const commentsDatabase = require('../../mcapi/db/model/comments');

let verbose = true;

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
    return matchedUsers;
}

function* notify(user, comment) {
    console.log("Simulate Notify - start: ", user, " of ", comment.id);
    console.log("here is where we send e-mail");
    console.log("Simulate Notify -  done: ", user, " of ", comment.id);
}

function* promiseNotify(comment) {
    console.log("promiseNotify start", comment.id);
    let otherUsers = yield * getOtherUsersFor(comment);
    console.log("promiseNotify - otherUsers count = ", otherUsers.length);
    for (let i = 0; i < otherUsers.length; i++ ) {
        let user = otherUsers[i];
        yield * notify(user, comment);
    }
    console.log("promiseNotify done ", comment.id);
}

function notifyOtherUsers (comment) {
    console.log("notifyOtherUsers - start")
    Promise.coroutine(promiseNotify)(comment)
        .then(() => {
            console.log("notifyOtherUsers - done");
        });
    console.log("notifyOtherUsers - return")
}

module.exports = {
    notifyOtherUsers
};

