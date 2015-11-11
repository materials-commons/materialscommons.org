module.exports = function(directories) {
    const parse = require('co-body');

    return {
        get: get,
        create: create
    };

    ////////////////
    function* get(next) {
        let dirID = this.params.directory_id || 'top';
        this.body = yield get.tree(this.params.project_id, dirID);
        yield next;
    }

    function* create(next) {
        let dirArgs = yield parse(this);
        this.body = yield directories.create(this.params.project_id, dirArgs);
        yield next;
    }
};
