Application.Services.factory('Clone',
    [function () {
        return {
            get_clone: function (doc, draft) {
                var input_sample_copy =  angular.copy(draft.process.input_conditions['sample']);
                doc.sample = {};
                doc.sample = input_sample_copy.sample;
                doc.sample.parent_id = input_sample_copy.sample.id;
                console.log(doc.sample);
                return doc;
            }
        };
    }]);