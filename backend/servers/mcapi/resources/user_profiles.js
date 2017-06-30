const profiles = require('../db/model/user_profiles');

function* getValueFromProfile(next) {
    let name = this.params.name;
    let userId = this.reqctx.user.id
    let rv = yield profiles.getFromUserProfile(userId, name);
    if (rv == null) rv = '';
    this.body = {
        val: rv
    };
    yield next;
}

function* updaeValueInPreofile(next) {
    let name = this.params.name;
    let userId = this.reqctx.user.id
    let attrs = yield parse(this);
    let value = attrs.value;
    let rv = yield profiles.clearFromUserProfile(userId, name, value);
    if (rv == null) rv = '';
    this.body = {
        val: rv
    };
    yield next;
}


function* deleteValueInPreofile(next) {
    let name = this.params.name;
    let userId = this.reqctx.user.id
    let rv = yield profiles.clearFromUserProfile(userId, name);
    if (rv == null) rv = '';
    this.body = {
        val: rv
    };
    yield next;
}

function createResource() {
    const router = new Router();

    router.get('/:name', getValueFromProfile);
    router.put('/:name', updateValueInProfile);
    router.delete('/:name', deleteValueInPreofile);

    return router;
}


module.exports = {
    createResource
};
