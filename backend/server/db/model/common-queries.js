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
