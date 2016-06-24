module.exports.sampleDetailsRql = function sampleDetailsRql(rql, r) {
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
};

module.exports.processDetailsRql = function processDetailsRql(rql, r) {
    return rql.merge(function(process) {
        return {
            setup: r.table('process2setup').getAll(process('id'), {index: 'process_id'})
                .eqJoin('setup_id', r.table('setups')).zip()
                .merge(function(setup) {
                    return {
                        properties: r.table('setupproperties')
                            .getAll(setup('setup_id'), {index: 'setup_id'})
                            .coerceTo('array')
                    }
                }).coerceTo('array'),

            input_samples: r.table('process2sample').getAll(process('id'), {index: 'process_id'})
                .eqJoin('sample_id', r.table('samples')).zip()
                .merge(function(sample) {
                    return {
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
                        files: r.table('sample2datafile').getAll(sample('id'), {index: 'sample_id'})
                            .eqJoin('datafile_id', r.table('datafiles')).zip().pluck('id', 'name')
                            .coerceTo('array')
                    }
                }).coerceTo('array'),
            input_files: r.table('process2file').getAll(process('id'), {index: 'process_id'})
                .filter({direction: 'in'})
                .eqJoin('datafile_id', r.table('datafiles'))
                .zip().coerceTo('array'),
            output_files: r.table('process2file').getAll(process('id'), {index: 'process_id'})
                .filter({direction: 'out'})
                .eqJoin('datafile_id', r.table('datafiles'))
                .zip().coerceTo('array')
        }
    });
};
