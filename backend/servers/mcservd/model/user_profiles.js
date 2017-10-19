const r = require('../r');

function* getProfileForUser(userId) {
    let results = yield r.table('userprofiles').getAll(userId, {index: 'user_id'})
    if (results.length == 0) {
        yield r.table('userprofiles').insert({
            user_id: userId
        });
        results = yield r.table('userprofiles').getAll(userId, {index: 'user_id'})
        if (results.length == 0) return null
    }
    return results[0];
}

function* storeInUserProfile(userId, name, value) {
    let profile = yield getProfileForUser(userId);
    if (profile == null) return null;
    let id = profile.id;
    let part = {}
    part[name] = value;
    let results = yield r.table('userprofiles').get(id).update(part);
    if (results.replaced == 1 || results.unchanged == 1) return value;
    return null;
}

function* getFromUserProfile(userId, name) {
    let profile = yield getProfileForUser(userId);
    if (profile == null) return null;
    if (profile[name]) return profile[name];
    return null;
}

function* clearFromUserProfile(userId, name) {
    let profile = yield getProfileForUser(userId);
    if (profile == null) return null;
    let id = profile.id;
    let value = profile[name];
    delete profile[name];
    let results = yield r.table('userprofiles').get(id).replace(profile);
    if (results.replaced == 1) return value;
    return null;
}

module.exports = {
    storeInUserProfile,
    getFromUserProfile,
    clearFromUserProfile
};