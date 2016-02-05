module.exports = function (r) {
    const run = require('./run');
    const getSingle = require('./get-single');
    return {
        get: function (id, index) {
            return getSingle(r, 'samples', id, index);
        },
        getList: getList,
        findInProject: findInProject,
        countAttributesInSample: countAttributesInSample,
        validateAttribute: validateAttribute,
        validateAttributeSet: validateAttributeSet,
        getMeasurements: getMeasurements
    };

    /////////////////

    function* get(sampleID) {
        let rql = r.table('samples').getAll(sampleID)
            .merge(function (sample) {
                return {
                    processes: r.table('process2sample').getAll(sample('property_set_id'), {index: 'property_set_id'})
                        .eqJoin('process_id', r.table('processes')).zip()
                        .pluck('process_id', 'name', 'does_transform', 'process_type', 'direction')
                        .filter({direction: 'out'})
                        .merge(function (process) {
                            return {
                                measurements: r.table('process2measurement')
                                    .getAll(process('process_id'), {index: 'process_id'})
                                    .eqJoin('measurement_id', r.table('measurements')).zip().coerceTo('array')
                            };
                        }).coerceTo('array'),
                    files: r.table('sample2datafile').getAll(sample('id'), {index: 'sample_id'})
                        .eqJoin('datafile_id', r.table('datafiles')).zip().coerceTo('array'),
                    properties: r.table('propertyset2property')
                        .getAll(sample('property_set_id'), {index: 'property_set_id'})
                        .eqJoin('property_id', r.table('properties')).zip()
                        .orderBy('name')
                        .merge(function (property) {
                            return {
                                best_measure: r.table('best_measure_history')
                                    .getAll(property('best_measure_id'))
                                    .eqJoin('measurement_id', r.table('measurements'))
                                    .zip().coerceTo('array'),
                                measurements: r.table('property2measurement')
                                    .getAll(property('id'), {index: 'property_id'})
                                    .eqJoin('measurement_id', r.table('measurements')).zip().coerceTo('array')
                            };
                        }).coerceTo('array')
                }
            })
    }

    function* getList(projectID) {
        let rql = sampleDetailsRql(r.table('project2sample').getAll(projectID, {index: 'project_id'})
            .eqJoin('sample_id', r.table('sample2propertyset'), {index: 'sample_id'})
            .zip().filter({'current': true})
            .eqJoin('sample_id', r.table('samples')).zip()).filter({is_grouped: false});
        let samples = yield run(rql);
        samples = samples.map(s => {
            s.transforms = s.processes.filter(p => p.does_transform).length;
            s.properties = s.properties.map(p => {
                if (p.best_measure.length) {
                    p.best_measure = p.best_measure[0];
                } else {
                    p.best_measure = null;
                }
                return p;
            });
            return s;
        });
        return {val: samples};
    }

    function sampleDetailsRql(rql) {
        return rql.merge(function (sample) {
            return {
                files: r.table('sample2datafile').getAll(sample('id'), {index: 'sample_id'})
                    .eqJoin('datafile_id', r.table('datafiles')).zip().pluck('id', 'name')
                    .coerceTo('array'),
                properties: r.table('propertyset2property')
                    .getAll(sample('property_set_id'), {index: 'property_set_id'})
                    .eqJoin('property_id', r.table('properties')).zip()
                    .orderBy('name')
                    .merge(function (property) {
                        return {
                            best_measure: r.table('best_measure_history')
                                .getAll(property('best_measure_id'))
                                .eqJoin('measurement_id', r.table('measurements'))
                                .zip().coerceTo('array')
                        }
                    }).coerceTo('array'),
                processes: r.table('process2sample').getAll(sample('id'), {index: 'sample_id'})
                    .eqJoin('process_id', r.table('processes')).zip().coerceTo('array')
            }
        });
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
            .getAll(r.args(attrIDs), {index: 'attribute_id'});
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
};
