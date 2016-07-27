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
        return r.table('tag2dataset').getAll([params.tag, params.dataset_id], {index: 'tag_dataset'});
    }

    function addTag2Dataset(params) {
        return r.table('tag2dataset').insert(params, {returnChanges: true});
    }
};

