const r = require('../r');

function* removeUnusedSamples(sampleIds) {
    for (let i = 0; i < sampleIds.length; i++) {
        let sampleId = sampleIds[i];
        let p2s = yield r.table('process2sample').getAll(sampleId, {index: 'sample_id'});
        if (!p2s.length) {
            // Sample is not used anywhere
            yield removeSample(sampleId);
        }
    }
}

function* removeSample(sampleId) {
    yield r.table('project2sample').getAll(sampleId, {index: 'sample_id'}).delete();
    yield r.table('experiment2sample').getAll(sampleId, {index: 'sample_id'}).delete();

    // TODO: How to delete property sets associated with non-existent samples?
    // let propertySets = yield r.table('sample2propertyset').getAll(sampleId, {index: 'sample_id'});
    yield r.table('sample2propertyset').getAll(sampleId, {index: 'sample_id'}).delete();


    yield r.table('sample2datafile').getAll(sampleId, {index: 'sample_id'}).delete();
}

function* canDeleteSamples(sampleIds, processId) {
    //console.log('canDeleteSamples', sampleIds, processId);
    if (yield samplesOnlyInputInProcess(sampleIds, processId)) {
        //console.log("  Allow delete samplesOnlyInputInProcess");
        return true;
    } else if (yield samplesUsedInOtherProcesses(sampleIds, processId)) {
        //console.log("  Don't allow delete samplesUsedInOtherProcesses");
        return false;
    }

    //console.log('  Allow delete other checks passed');
    return true;
}

function* samplesOnlyInputInProcess(sampleIds, processId) {
    let toLookup = sampleIds.map(id => [processId, id]);
    let p2s = yield r.table('process2sample').getAll(r.args(toLookup), {index: 'process_sample'});
    let onlyInput = true;
    p2s.forEach(entry => {
        if (entry.direction !== 'in') {
            onlyInput = false;
        }
    });

    return onlyInput;
}

function* samplesUsedInOtherProcesses(sampleIds, processId) {
    // Only need to check output samples that are used as inputs
    let outputSampleEntries = yield r.table('process2sample').getAll(r.args(sampleIds), {index: 'sample_id'})
        .filter({direction: 'out'});
    let samplesToLookup = outputSampleEntries.map(entry => entry.sample_id);

    let p2s = yield r.table('process2sample').getAll(r.args(samplesToLookup), {index: 'sample_id'}).filter({direction: 'in'});
    let foundOther = false;
    p2s.forEach(e => {
        if (e.process_id !== processId) {
            //console.log('sample used in other process', e, processId);
            foundOther = true;
        }
    });

    return foundOther;
}

module.exports = {
    removeUnusedSamples,
    canDeleteSamples
};
