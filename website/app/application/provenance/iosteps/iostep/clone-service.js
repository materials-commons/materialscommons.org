Application.Services.factory('Clone',
    [function () {
        return {
            get_clone: function (doc, draft) {
                var input_sample_copy =  angular.copy(draft.attributes.input_conditions['Pick Sample']);
                doc.sample = {};
//                doc = input_sample_copy.sample;
//                doc.
//                doc.sample.id = '';
                doc.sample.model =  input_sample_copy.sample.model;
                doc.sample.owner =  input_sample_copy.sample.owner;
                doc.model = input_sample_copy.sample.model;
                doc.model.name =  doc.model.name + ' : ' + draft.attributes.process.name;
                return doc;

            }
        };
    }]);