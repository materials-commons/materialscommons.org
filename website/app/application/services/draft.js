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
                additional_properties: {},
                done: false,
                template_id: template.id
            };

            draft.completed = false;

            draft.inputs = {};
            draft.outputs = {};
            template.input_templates.forEach(function(t) {
                draft.inputs[t.id] = {};
                draft.inputs[t.id].name = "(I) " + t.template_name;
                draft.inputs[t.id].done = false;
                draft.inputs[t.id].note = null;
                draft.inputs[t.id].showNote = false;
                draft.inputs[t.id].properties = {};
                draft.inputs[t.id].custom_properties = {};
                draft.inputs[t.id].additional_properties = {};
                t.default_properties.forEach(function(p) {
                    draft.inputs[t.id].properties[p.attribute] = {
                        name: p.name,
                        value: "",
                        unit: "",
                        note: null,
                        showNote: false
                    };
                });

                if (t.template_pick == "pick_sample") {
                    draft.inputs[t.id].properties.sample = {
                        sample: null,
                        note: null,
                        showNote: false
                    };
                }
            });

            if (template.required_input_files) {
                draft.inputs.files = {};
                draft.inputs.files.showNote = false;
                draft.inputs.files.note = null;
                draft.inputs.files.name = "(I) Files" ;
                draft.inputs.files.files = [];
                draft.inputs.files.done = false;
            }

            template.output_templates.forEach(function(t) {
                draft.outputs[t.id] = {};
                draft.outputs[t.id].name = "(O) " + t.template_name;
                draft.outputs[t.id].done = false;
                draft.outputs[t.id].note = null;
                draft.outputs[t.id].showNote = false;
                draft.outputs[t.id].properties = {};
                draft.outputs[t.id].custom_properties = {};
                draft.outputs[t.id].additional_properties = {};
                t.default_properties.forEach(function(p) {
                    draft.outputs[t.id].properties[p.attribute] = {
                        name: p.name,
                        value: "",
                        unit: "",
                        note: null,
                        showNote: false
                    };
                });

                if (t.template_pick == "pick_sample") {
                    draft.outputs[t.id].properties.sample = {
                        sample: null,
                        note: null,
                        showNote: false
                    };
                }
            });

            if (template.required_output_files) {
                draft.outputs.files = {};
                draft.outputs.files.name = "(O) Files";
                draft.outputs.files.note = null;
                draft.outputs.files.showNote = false;
                draft.outputs.files.files = [];
                draft.outputs.files.done = false;
            }
            return draft;
        }
    };

    return service;
}
