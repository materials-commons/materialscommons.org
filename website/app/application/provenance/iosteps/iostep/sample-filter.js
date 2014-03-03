Application.Filters.filter('samplefilter', function () {

    return function (samples, doc) {
        if (samples && doc.material) {
            var i, return_samples = [];
            for (i = 0; i < samples.length; i++) {
                if (samples[i].material.name === doc.material.name) {
                    return_samples.push(samples[i]);
                }
            }
            return return_samples;


        }

    };
});