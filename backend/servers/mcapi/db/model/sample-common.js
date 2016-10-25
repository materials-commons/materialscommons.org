module.exports = function(r) {
    return {
        removeUnusedSamples
    };

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
};
