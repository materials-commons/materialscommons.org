Application.Services.factory('draft', draftService);

function draftService() {
    var service = {
        createProvenance: function(template) {
            var draft = {};
            draft.process = {
                name: "",
                description: "",
                run_dates: [],
                notes: [],
                tags: [],
                custom_properties:{},
                stepType: "process",
                currentStep: "process",
                additional_properties: {}
            };

            draft.inputs = {};
            draft.outputs = {};
            template.input_templates.forEach(function(t) {
                draft.inputs[t.id] = {};
                draft.inputs[t.id].done = false;
                draft.inputs[t.id].properties = {};
                draft.inputs[t.id].custom_properties = {};
                draft.inputs[t.id].additional_properties = {};
                t.default_properties.forEach(function(p) {
                    draft.inputs[t.id].properties[p.attribute] = {
                        value: "",
                        unit: ""
                    };
                });
                if (t.template_pick == "pick_sample") {
                    draft.inputs[t.id].properties.sample = null;
                }
            });

            if (template.required_input_files) {
                draft.inputs.files = {};
                draft.inputs.files.files = [];
                draft.inputs.files.done = false;
            }

            template.output_templates.forEach(function(t) {
                draft.outputs[t.id] = {};
                draft.outputs[t.id].done = false;
                draft.outputs[t.id].properties = {};
                draft.outputs[t.id].custom_properties = {};
                draft.outputs[t.id].additional_properties = {};
                t.default_properties.forEach(function(p) {
                    draft.outputs[t.id].properties[p.attribute] = {
                        value: "",
                        unit: ""
                    };
                });
                if (t.template_pick == "pick_sample") {
                    draft.outputs[t.id].properties.sample = null;
                }
            });

            if (template.required_output_files) {
                draft.outputs.files = {};
                draft.outputs.files.files = [];
                draft.outputs.files.done = false;
            }
            return draft;
        }
    };

    return service;
}
