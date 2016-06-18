module.exports = function(r) {
    const dbExec = require('./run');
    const model = require('./model')(r);
    const db = require('./db')(r);

    return {
        getSample,
        getAllSamplesForProject,
        createSamples,
        sampleInProject,
        allSamplesInProject,
        isValidCreateSamplesProcess,
        updateSamples,
        addSamplesMeasurements,
        updateSamplesMeasurements,
        deleteSamplesMeasurements
    };

    /////////////////

    function* getSample(sampleID) {
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
            });
        let sample = dbExec(rql);
        return {val: sample};
    }

    function* getAllSamplesForProject(projectID) {
        let rql = sampleDetailsRql(r.table('project2sample').getAll(projectID, {index: 'project_id'})
            .eqJoin('sample_id', r.table('sample2propertyset'), {index: 'sample_id'})
            .zip().filter({'current': true})
            .eqJoin('sample_id', r.table('samples')).zip());
        let samples = yield dbExec(rql);
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

    function* sampleInProject(projectId, sampleId) {
        let samples = yield r.table('project2sample').getAll([projectId, sampleId], {index: 'project_sample'});
        return samples.length !== 0;
    }

    function* allSamplesInProject(projectId, sampleIds) {
        let indexArgs = sampleIds.map((sampleId) => [projectId, sampleId]);
        let samples = yield r.table('project2sample').getAll(r.args(indexArgs), {index: 'project_sample'});
        return samples.length === sampleIds.length;
    }

    function* createSamples(projectId, processId, samples, owner) {
        let pset = new model.PropertySet(true);
        let createdPSet = yield db.insert('propertysets', pset);
        let createdSamples = [];
        for (let i = 0; i < samples.length; i++) {
            let sampleParams = samples[i];
            let s = new model.Sample(sampleParams.name, sampleParams.description, owner);
            let createdSample = yield db.insert('samples', s);
            let s2ps = new model.Sample2PropertySet(createdSample.id, createdPSet.id, true);
            yield db.insert('sample2propertyset', s2ps);
            let proc2sample = new model.Process2Sample(processId, createdSample.id, createdPSet.id, 'out');
            let proj2sample = new model.Project2Sample(projectId, createdSample.id);
            yield db.insert('process2sample', proc2sample);
            yield db.insert('project2sample', proj2sample);
            createdSamples.push({name: s.name, id: createdSample.id, property_set_id: createdPSet.id});
        }

        return {val: {samples: createdSamples}};
    }

    function* isValidCreateSamplesProcess(projectId, processId) {
        let processes = yield r.table('project2process').getAll([projectId, processId], {index: 'project_process'});
        if (processes.length === 0) {
            return false;
        }
        let process = yield r.table('processes').get(processId)
            .merge((p) => r.table('templates').get(p('template_id')).pluck('category'));
        return process.category === 'create_sample';
    }

    function* updateSamples(samples) {
        yield r.table('samples').insert(samples, {conflict: 'update'});
        return {val: samples};
    }

    function* addSamplesMeasurements() {
        return null;
    }

    function* updateSamplesMeasurements() {
        return null;
    }

    function* deleteSamplesMeasurements() {
        return null;
    }
};
