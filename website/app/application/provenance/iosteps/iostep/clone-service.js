Application.Services.factory('Clone',
    [function () {
        return {
            get_clone: function (doc, draft) {
                var input_sample_copy =  angular.copy(draft.process.input_conditions['Pick Sample']);
                doc.sample = {};
                doc.sample.model =  input_sample_copy.sample.model;
                doc.sample.owner =  input_sample_copy.sample.owner;
                doc.model = input_sample_copy.sample.model;
                doc.model.name =  doc.model.name + ' : ' + draft.process.process.name;
                return doc;
            }
        };
    }]);