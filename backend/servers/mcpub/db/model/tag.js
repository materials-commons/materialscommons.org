'use strict';

module.exports = function() {
    var r = require('./../../dash');

    return {
        insert: addTag,
        getTag: getTag,
        deleteTag: deleteTag,
        addTag2Dataset: addTag2Dataset,
        getTag2Dataset: getTag2Dataset,
        deleteTag2Dataset: deleteTag2Dataset,
        getAllDatasetsForTag: getAllDatasetsForTag
    };

    function addTag(params) {
        return r.table('tags').insert({id: params.tag, user_id: params.user_id}, {returnChanges: true});
    }

    function getTag(tag) {
        return r.table('tags').get(tag)
    }

    function deleteTag(tag) {
        return r.table('tags').get(tag).delete();
    }

    function addTag2Dataset(params) {
        return r.table('tag2dataset').insert(params, {returnChanges: true});
    }

    function getTag2Dataset(params) {
        return r.table('tag2dataset').getAll(params.tag,{index: 'tag'}).filter({dataset_id:params.dataset_id});
    }

    function deleteTag2Dataset(id) {
        return r.table('tag2dataset').get(id).delete();
    }

    function getAllDatasetsForTag(tag) {
        return r.table('tag2dataset').getAll(tag,{index: 'tag'}).pluck('dataset_id');
    }

};
