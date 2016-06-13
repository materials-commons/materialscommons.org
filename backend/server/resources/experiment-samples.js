module.exports = function(samples, schema) {
    return {
        addSamples,
        updateSample,
        updateMultipleSamples,
        deleteSample
    }

    function* addSamples(next) {
        yield next;
    }

    function* updateSample(next) {
        yield next;
    }

    function* updateMultipleSamples(next) {
        yield next;
    }

    function* deleteSample(next) {
        yield next;
    }
};