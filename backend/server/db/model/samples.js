module.exports = function(r) {
    'use strict';

    let run = require('./run');
    let getSingle = require('./get-single');
    return {
        create: create,
        forUser: forUser,
        get: function(id, index) {
            return getSingle(r, 'samples', id, index);
        }
    };

    /////////////////

    function forUser(user) {
        let rql;

        return run(rql);
    }

    function create(user, project, sample) {
        let rql;

        return run(rql);
    }
};

function s() {
    'use strict';
    let sample = {
        name: "",
        description: "",
        owner: ""
    };
}
