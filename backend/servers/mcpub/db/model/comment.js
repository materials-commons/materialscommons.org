'use strict';

module.exports = function() {
    var r = require('./../../dash');

    return {
        insert: addComment
    };

    function addComment(params) {
        return r.table('comments').insert(params, {returnChanges: true});
    }
};
