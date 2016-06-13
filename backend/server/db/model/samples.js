module.exports = function(r) {
    const run = require('./run');
    const getSingle = require('./get-single');
    return {
        get: function(id, index) {
            return getSingle(r, 'samples', id, index);
        },
        getList,
        createSamples
    };

    /////////////////

    function* get(sampleID) {
        let rql = r.table('samples').getAll(sampleID)
            .merge(function(sample) {
                return {
                    processes: r.table('process2sample').getAll(sample('property_set_id'), {index: 'property_set_id'})
                        .eqJoin('process_id', r.table('processes')).zip()
                        .pluck('process_id', 'name', 'does_transform', 'process_type', 'direction')
                        .filter({direction: 'out'})
                        .merge(function(process) {
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
                        .merge(function(property) {
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
            .eqJoin('sample_id', r.table('samples')).zip());
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
        return rql.merge(function(sample) {
            return {
                files: r.table('sample2datafile').getAll(sample('id'), {index: 'sample_id'})
                    .eqJoin('datafile_id', r.table('datafiles')).zip().pluck('id', 'name')
                    .coerceTo('array'),
                properties: r.table('propertyset2property')
                    .getAll(sample('property_set_id'), {index: 'property_set_id'})
                    .eqJoin('property_id', r.table('properties')).zip()
                    .orderBy('name')
                    .merge(function(property) {
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

    //================================

    function* createSamples(projectId) {

    }
};
