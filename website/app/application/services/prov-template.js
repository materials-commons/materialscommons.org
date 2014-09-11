Application.Services.factory("provTemplate", [provTemplate]);

function provTemplate() {
    var service = {

        _handleProcessStep: function(templates, filesRequired) {
            if (templates.length !== 0) {
                return templates[0].template_name;
            }

            // templates.length === 0, so check filesRequired
            if (filesRequired) {
                return "files";
            }

            // Nothing matches, so...
            return "";
        },

        _nextTemplateStep: function(currentStep, templates, filesRequired) {
            if (currentStep == "files") {
                // We are on the files step which is the last step for these
                // templates.
                return "";
            }

            if (currentStep === "process") {
                return service._handleProcessStep(templates, filesRequired);
            }

            var i = _.indexOf(templates, function(template) {
                return template.template_name == currentStep;
            });

            console.log("i = " + i);
            if (i == -1) {
                // Couldn't find currentStep. This is an error
                // on the api users part. We could check files,
                // but better to just say no.
                return "";
            }

            if (i+1 > templates.length) {
                // No more templates, check if we should ask for files.
                if (filesRequired) {
                    return "files";
                }

                return "";
            }

            return templates[i+1].template_name;
        },

        _checkFromOutputs: function(currentStep, template) {
            next = service._nextTemplateStep(currentStep, template.output_templates,
                                             template.required_output_files);
            if (next !== "") {
                return {
                    stepType: "output",
                    currentStep: next
                };
            }

            return {
                stepType: "done",
                currentStep: "done"
            };
        },

        _checkFromInputs: function(currentStep, template) {
            next = service._nextTemplateStep(currentStep, template.input_templates,
                                             template.required_input_files);
            if (next !== "") {
                return {
                    stepType: "input",
                    currentStep: next
                };
            }

            return service._checkFromOutputs(currentStep, template);

        },

        nextStep: function(currentType, currentStep, template) {
            console.log("currentType = " + currentType);
            if (currentType == "process" || currentType == "input") {
                return service._checkFromInputs(currentStep, template);
            } else if (currentType == "output") {
                return service._checkFromOutputs(currentStep, template);
            } else {
                return {
                    stepType: "done",
                    currentStep: "done"
                };
            }
        }
    };
    return service;
}
