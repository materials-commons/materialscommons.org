function sampleDetailsRql(rql, r) {
    return rql.merge(function(sample) {
        return {
            versions: r.table('process2sample').getAll(sample('id'), {index: 'sample_id'})
                .filter({direction: 'out'})
                .eqJoin('process_id', r.table('processes')).zip()
                .coerceTo('array'),
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
                    };
                }).coerceTo('array'),
            processes: r.table('process2sample').getAll(sample('id'), {index: 'sample_id'})
                .eqJoin('process_id', r.table('processes')).zip().coerceTo('array')
        };
    });
}

function fileDetailsRql(rql, r) {
    return rql.merge(file => {
        return {
            samples: r.table('sample2datafile').getAll(file('id'), {index: 'datafile_id'})
                .eqJoin('sample_id', r.table('samples')).zip().pluck('id', 'name')
                .coerceTo('array'),
            processes: r.table('process2file').getAll(file('id'), {index: 'datafile_id'})
                .eqJoin('datafile_id', r.table('datafiles'))
                .zip().coerceTo('array')
        };
    });
}

function datasetDetailsRql(rql, r) {
    return rql.merge(ds => {
        return {
            samples: r.table('dataset2sample').getAll(ds('id'), {index: 'dataset_id'})
                .eqJoin('sample_id', r.table('samples')).zip().coerceTo('array'),
            processes: datasetProcessDetailsRql(r.table('dataset2process').getAll(ds('id'), {index: 'dataset_id'})
                .eqJoin('process_id', r.table('processes')).zip(), r).coerceTo('array'),
            comments: r.table('comments').getAll(ds('id'), {index: 'item_id'}).coerceTo('array'),
            files: r.table('dataset2datafile').getAll(ds('id'), {index: 'dataset_id'})
                .eqJoin('datafile_id', r.table('datafiles')).zip()
                .merge(df => {
                    return {
                        path: r.table('datadir2datafile').getAll(df('datafile_id'), {index: 'datafile_id'})
                            .eqJoin('datadir_id', r.table('datadirs')).zip().pluck('name').nth(0).getField('name')
                    };
                }).coerceTo('array'),
        };
    });
}

function datasetProcessDetailsRql(rql, r) {
    return rql.merge(function(process) {
        return {
            input_samples: r.table('process2sample').getAll(process('id'), {index: 'process_id'})
                .filter({'direction': 'in'})
                .eqJoin('sample_id', r.table('samples')).zip().coerceTo('array'),
            output_samples: r.table('process2sample').getAll(process('id'), {index: 'process_id'})
                .filter({'direction': 'out'})
                .eqJoin('sample_id', r.table('samples')).zip().coerceTo('array'),
        };
    });
}

function processDetailsSimpleRql(rql, r) {
    return rql.merge(function(process) {
        return {
            setup: r.table('process2setup').getAll(process('id'), {index: 'process_id'})
                .eqJoin('setup_id', r.table('setups')).zip()
                .merge(function(setup) {
                    return {
                        properties: r.table('setupproperties')
                            .getAll(setup('setup_id'), {index: 'setup_id'})
                            .coerceTo('array')
                    };
                }).coerceTo('array'),
            input_samples: r.table('process2sample').getAll(process('id'), {index: 'process_id'})
                .filter({'direction': 'in'})
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
                                };
                            }).coerceTo('array')
                    };
                })
                .coerceTo('array'),
            output_samples: r.table('process2sample').getAll(process('id'), {index: 'process_id'})
                .filter({'direction': 'out'})
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
                                };
                            }).coerceTo('array')
                    };
                })
                .coerceTo('array'),
            files: r.table('process2file').getAll(process('id'), {index: 'process_id'})
                .eqJoin('datafile_id', r.table('datafiles')).zip().coerceTo('array'),
        };
    });
}

function processDetailsRql(rql, r) {
    return rql.merge(function(process) {
        return {
            setup: r.table('process2setup').getAll(process('id'), {index: 'process_id'})
                .eqJoin('setup_id', r.table('setups')).zip()
                .merge(function(setup) {
                    return {
                        properties: r.table('setupproperties')
                            .getAll(setup('setup_id'), {index: 'setup_id'})
                            .coerceTo('array')
                    };
                }).coerceTo('array'),

            input_samples: r.table('process2sample').getAll(process('id'), {index: 'process_id'})
                .filter({'direction': 'in'})
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
                                };
                            }).coerceTo('array'),
                        files: r.table('sample2datafile').getAll(sample('id'), {index: 'sample_id'})
                            .eqJoin('datafile_id', r.table('datafiles')).zip().pluck('id', 'name')
                            .coerceTo('array')
                        // processes: r.table('process2sample').getAll(sample('id'), {index: 'sample_id'})
                        //     .pluck('process_id', 'sample_id').distinct()
                        //     .eqJoin('process_id', r.table('processes')).zip().coerceTo('array')
                    };
                }).coerceTo('array'),
            output_samples: r.table('process2sample').getAll(process('id'), {index: 'process_id'})
                .filter({'direction': 'out'})
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
                                };
                            }).coerceTo('array'),
                        files: r.table('sample2datafile').getAll(sample('id'), {index: 'sample_id'})
                            .eqJoin('datafile_id', r.table('datafiles')).zip().pluck('id', 'name')
                            .coerceTo('array')
                        // processes: r.table('process2sample').getAll(sample('id'), {index: 'sample_id'})
                        //     .pluck('process_id', 'sample_id').distinct()
                        //     .eqJoin('process_id', r.table('processes')).zip().coerceTo('array')
                    };
                }).coerceTo('array'),
            measurements: r.table('process2measurement').getAll(process('id'), {index: 'process_id'})
                .eqJoin('measurement_id', r.table('measurements')).zip()
                .merge(p2m => {
                    return {
                        is_best_measure: r.table('best_measure_history')
                            .getAll(p2m('measurement_id'), {index: 'measurement_id'}).count()
                    };
                })
                .coerceTo('array'),
            files_count: r.table('process2file').getAll(process('id'), {index: 'process_id'}).count(),
            files: r.table('process2file').getAll(process('id'), {index: 'process_id'})
                .eqJoin('datafile_id', r.table('datafiles')).zip().coerceTo('array'),
            filesLoaded: true,
            // files: r.table('process2file').getAll(process('id'), {index: 'process_id'})
            //     .eqJoin('datafile_id', r.table('datafiles')).zip()
            //     .merge(f => {
            //         return {
            //             samples: r.table('sample2datafile').getAll(f('id'), {index: 'datafile_id'})
            //                 .eqJoin('sample_id', r.table('samples')).zip()
            //                 .distinct().coerceTo('array')
            //         };
            //     })
            //     .coerceTo('array'),
            input_files: r.table('process2file').getAll(process('id'), {index: 'process_id'})
                .filter({direction: 'in'})
                .eqJoin('datafile_id', r.table('datafiles'))
                .zip().coerceTo('array'),
            output_files: r.table('process2file').getAll(process('id'), {index: 'process_id'})
                .filter({direction: 'out'})
                .eqJoin('datafile_id', r.table('datafiles'))
                .zip().coerceTo('array')
        };
    });
}

module.exports = {
    sampleDetailsRql,
    datasetProcessDetailsRql,
    fileDetailsRql,
    datasetDetailsRql,
    processDetailsSimpleRql,
    processDetailsRql
};
