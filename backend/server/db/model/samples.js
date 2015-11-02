module.exports = function(r) {
    'use strict';

    let run = require('./run');
    let getSingle = require('./get-single');
    return {
        update: update,
        forUser: forUser,
        get: function(id, index) {
            return getSingle(r, 'samples', id, index);
        },
        allForProject: allForProject,
        findInProject: findInProject,
        countAttributesInSample: countAttributesInSample,
        validateAttribute: validateAttribute,
        validateAttributeSet: validateAttributeSet,
        getMeasurements: getMeasurements
    };

    /////////////////

    function forUser(user) {
        let rql;

        return run(rql);
    }

    function update(sample) {
        let rql;
        return run(rql);
    }

    function* allForProject(projectID) {
        let rql = r.table('project2sample').getAll(projectID, {index: 'project_id'}).
            eqJoin('sample_id', r.table('sample2propertyset'), {index: 'sample_id'}).
            zip().filter({'current': true}).
            eqJoin('sample_id', r.table('samples')).zip();
        return yield run(rql);
    }

    function findInProject(projectID, index, key) {
        let filterTerm = {};
        filterTerm[index] = key;
        let rql = r.table('project2sample')
                .getAll(projectID, {index: 'project_id'})
                .eqJoin('sample_id', r.table('samples'))
                .zip()
                .filter(filterTerm);
        return run(rql);
    }

    function *countAttributesInSample(asetID, attrIDs) {
        let rql = r.table('attributeset2attribute')
                .getAll(r.args(attrIDs), {index:'attribute_id'});
        return yield rql.filter({attribute_set_id: asetID}).count();
    }

    /**
     * Returns a list of sample ids that contain this attribute id.
     * @param {String} sampleID - The sample id the attribute id should be in.
     * @param {String} attributeID - The attribute id to lookup.
     * @returns {Promise}
     */
    function validateAttribute(sampleID, attributeID) {
        let rql = r.table('sample2attributeset')
                .getAll(sampleID, {index: 'sample_id'})
                .eqJoin('attribute_set_id',
                        r.table('attributeset2attribute'),
                        {index: 'attribute_set_id'})
                .zip()
                .filter({attribute_id: attributeID});
        return run(rql);
    }

    /**
     * Returns a list of samples that contain the given attribute set id.
     * @param {String} sampleID - The sample id the attribute set should be.
     * @param {String} attrSetID - The attribute set id to lookup.
     * @returns {Promise}
     */
    function validateAttributeSet(sampleID, attrSetID) {
        let rql = r.table('sample2attributeset')
                .getAll(sampleID, {index: 'sample_id'})
                .filter({attribute_set_id: attrSetID});
        return run(rql);
    }

    /**
     * Returns a list of the measurements given that apply to the sampleID.
     * @param {String} sampleID - The sample id to filter by
     * @param {Array} measurements - Measurement ids to retrieve
     * @returns {Promise}
     */
    function getMeasurements(sampleID, measurements) {
        let rql = r.table('measurements').getAll(r.args(this, measurements));
        return run(rql.filter({sample_id: sampleID}));
    }

    /**
     * Returns the attribute ids from attrs that are in the given
     * attribute set id.
     * @param {String} asetID - The attribute set id all attributes must belong to.
     * @param {Array} attrs - The list of attributes to retrieve (filtered by asetID)
     */
    function getAttributesFromAS(asetID, attrs) {
        let rql = r.table('attributeset2attribute')
                .getAll(r.args(attrs), {index: 'attribute_id'});
        return run(rql.filter({attribute_set_id: asetID}));
    }
};
