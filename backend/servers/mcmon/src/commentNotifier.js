const r = require('./r');

const Promise = require('bluebird');

const commentsDatabase = require('../../mcapi/db/model/comments');

let verbose = true;

function* getOtherUsersFor (comment) {
    console.log("getOtherUsersFor", comment.id);

    let valComments = yield * commentsDatabase.getAllForItem(comment.item_id);
    console.log(valComments);
    allComments = valComments.val;
    console.log(allComments);

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
    yield Promise.delay(500);
    console.log("Simulate Notify -  done: ", user, " of ", comment.id);
}

function* promiseNotify(comment) {
    console.log(commentsDatabase);
    console.log("promiseNotify start", comment.id);
    let otherUsers = yield getOtherUsersFor(comment);
    console.log("promiseNotify - otherUsers = ", otherUsers);
    for (let i = 0; i < otherUsers.length; i++ ) {
        yield notify(user, comment);
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

