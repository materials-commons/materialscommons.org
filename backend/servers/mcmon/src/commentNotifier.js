const Promise = require("bluebird");
const r = require('./r');

const backendBase = '../../..';
const mcapiBase = backendBase + '/servers/mcapi';

const dbModelBase = mcapiBase + '/db/model'
const comments = require(dbModelBase + '/comments');

let verbose = true;

async function getOtherUsersFor (comment) {
    console.log("getOtherUsersFor", comment.id);

    let allComments = yield comments.getAllFor(comment.item_id);
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

async function notify(user, comment) {
    console.log("Notify: ", user, " of ", comment.id);
    yield Promise.delay(500);
}

async function notifyOtherUsers (comment) {
    console.log("for ", effectedComment.id);
    let otherUsers = await getOtherUsersFor(effectedComment);
    console.log("otherUsers = ", otherUsers);
    for (let i = 0; i < otherUsers.length; i++ ) {
        await notify(user, effectedComment);
    }
    console.log("done ", effectedComment.id);
}

module.exports = {
    notifyOtherUsers
};

