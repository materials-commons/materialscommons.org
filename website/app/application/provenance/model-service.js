Application.Provenance.Services.factory('Model', [function () {
    var service = {
        newProcess: function () {
            return {
                name: '',
                model: {
                    default_properties: [],
                    added_properties: []
                },
                notes: [],
                required_input_conditions: [],
                required_output_conditions: [],
                required_input_files: false,
                required_output_files: false,
                runs: [],
                template: "",
                experiment_run_date: ''
            };
        },

        newCondition: function () {
            return {
                description: "",
                name: "",
                id: "",
                materials: {},
                model: [],
                owner: "",
                template_birthtime: "",
                template_description: "",
                template_mtime: "",
                template_name: "",
                template_pick: "",
                template_type: "condition"
            };
        }
    };

    return service;
}]);
