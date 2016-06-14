module.exports = function(samples, schema) {
    return {
        addSamplesToExperiment,
        updateExperimentSamples,
        deleteSamplesFromExperiment
    };

    function* addSamplesToExperiment(next) {
        yield next;
    }

    function* updateExperimentSamples(next) {
        yield next;
    }

    function* deleteSamplesFromExperiment(next) {
        yield next;
    }
};