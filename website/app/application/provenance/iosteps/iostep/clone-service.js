Application.Services.factory('Clone',
    [function () {
        return {
            get_clone: function (doc, draft) {
                var input_sample_copy =  angular.copy(draft.attributes.input_conditions['Pick Sample']);
                doc.sample = {};
                doc.sample = input_sample_copy.sample;
                return doc;
            }
        };
    }]);