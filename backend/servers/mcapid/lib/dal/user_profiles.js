const r = require('../r');

async function getProfileForUser(userId) {
    let results = await r.table('userprofiles').getAll(userId, {index: 'user_id'})
    if (results.length == 0) {
        await r.table('userprofiles').insert({
            user_id: userId
        });
        results = await r.table('userprofiles').getAll(userId, {index: 'user_id'})
        if (results.length == 0) return null
    }
    return results[0];
}

async function storeInUserProfile(userId, name, value) {
    let profile = await getProfileForUser(userId);
    if (profile == null) return null;
    let id = profile.id;
    let part = {}
    part[name] = value;
    let results = await r.table('userprofiles').get(id).update(part);
    if (results.replaced == 1 || results.unchanged == 1) return value;
    return null;
}

async function getFromUserProfile(userId, name) {
    let profile = await getProfileForUser(userId);
    if (profile == null) return null;
    if (profile[name]) return profile[name];
    return null;
}

async function clearFromUserProfile(userId, name) {
    let profile = await getProfileForUser(userId);
    if (profile == null) return null;
    let id = profile.id;
    let value = profile[name];
    delete profile[name];
    let results = await r.table('userprofiles').get(id).replace(profile);
    if (results.replaced == 1) return value;
    return null;
}

module.exports = {
    storeInUserProfile,
    getFromUserProfile,
    clearFromUserProfile
};