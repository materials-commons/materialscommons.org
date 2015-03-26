module.exports = function(r) {
    'use strict';

    let run = require('./run');
    return {
        create: create,
        forUser: forUser
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
