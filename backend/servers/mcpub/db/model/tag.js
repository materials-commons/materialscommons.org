'use strict';

module.exports = function() {
    var r = require('./../../dash');

    return {
        insert: addTag,
        getTag: getTag,
        getTag2Dataset: getTag2Dataset,
        addTag2Dataset: addTag2Dataset
    };

    function addTag(params) {
        return r.table('tags').insert({id: params.tag, user_id: params.user_id}, {returnChanges: true});
    }

    function getTag(tag) {
        return r.table('tags').get(tag)
    }

    function getTag2Dataset(params) {
        return r.table('tags2datasets').getAll([params.tag, params.dataset_id], {index: 'tag_dataset'});
    }

    function addTag2Dataset(params) {
        return r.table('tags2datasets').insert(params, {returnChanges: true});
    }
};

