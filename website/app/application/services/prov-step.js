Application.Services.factory("provStep", ["pubsub", provStep]);

function provStep(pubsub) {
    var service = {
        steps: {},

        _handleProcessStep: function(templates, filesRequired) {
            if (templates.length !== 0) {
                return templates[0].id;
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
                return template.id == currentStep;
            });

            if (i == -1) {
                // Couldn't find currentStep. This is an error
                // on the api users part. We could check files,
                // but better to just say no.
                return "";
            }

            if (i+1 === templates.length) {
                // No more templates, check if we should ask for files.
                if (filesRequired) {
                    return "files";
                }

                return "";
            }

            return templates[i+1].id;
        },

        _checkFromOutputs: function(currentStep, template) {
            next = service._nextTemplateStep(currentStep, template.output_templates,
                                             template.required_output_files);
            if (next !== "") {
                return {
                    stepType: "outputs",
                    step: next
                };
            }

            return {
                stepType: "done",
                step: "done"
            };
        },

        _checkFromInputs: function(currentStep, template) {
            next = service._nextTemplateStep(currentStep, template.input_templates,
                                             template.required_input_files);
            if (next !== "") {
                return {
                    stepType: "inputs",
                    step: next
                };
            }

            // No inputs, so return first step from outputs, if any.
            if (template.output_templates.length > 0) {
                return {
                    stepType: "outputs",
                    step: template.output_templates[0].id
                };
            } else if (template.required_output_files) {
                return {
                    stepType:"outputs",
                    step: "files"
                };
            } else {
                return {
                    stepType: "done",
                    step: "done"
                };
            }

        },

        nextStep: function(currentType, currentStep, template) {
            if (currentType == "process" || currentType == "inputs") {
                return service._checkFromInputs(currentStep, template);
            } else if (currentType == "outputs") {
                return service._checkFromOutputs(currentStep, template);
            } else {
                return {
                    stepType: "done",
                    step: "done"
                };
            }
        },

        makeStep: function(stepType, step) {
            return {
                stepType: stepType,
                step: step
            };
        },

        setStep: function(project, step) {
            var onLeave = service.steps[project].onLeave;
            if (onLeave) {
                onLeave();
            }
            var currentStep = service.steps[project].currentStep;
            service.steps[project].lastStep = currentStep;
            service.steps[project].currentStep = step;
            service.steps[project].onLeave = null;
            pubsub.send("provenance.wizard.step");
        },

        getLastStep: function(project) {
            return service.steps[project].lastStep;
        },

        onLeave: function(project, f) {
            service.steps[project].onLeave = f;
        },

        setProjectNextStep: function(project, template) {
            var currentStep = service.getCurrentStep(project);
            var nextStep = service.nextStep(currentStep.stepType, currentStep.step, template);
            service.setStep(project, nextStep);
        },

        getCurrentStep: function(project) {
            return service.steps[project].currentStep;
        },

        _addFinishedIOStep: function(project, stepType, step)  {
            var i = _.indexOf(service.steps[project][stepType], step);
            if (i != -1) {
                service.steps[project][stepType].push(step);
            }
        },

        addFinishedInputStep: function(project, step) {
            service._addFinishedIOStep(project, "inputSteps", step);
        },

        addFinishedOutputStep: function(project, step) {
            service._addFinishedIOStep(project, "outputSteps", step);
        },

        clearFinishedSteps: function(project) {
            service.steps[project] = service._makeStepTracker();
        },

        isCurrentStep: function(project, stepType, step) {
            if (service.steps[project].currentStep.stepType === stepType &&
                service.steps[project].currentStep.step === step) {
                return true;
            }

            return false;
        },

        _isFinishedIOStep: function(project, stepType, step) {
            var i = _.indexOf(service.steps[project][stepType], step);
            // if i == -1 then we didn't find the step.
            return i != -1;
        },

        isFinishedStep: function(project, stepType, step) {
            switch (stepType) {
            case "done":
                return service.steps[project].done;
            case "process":
                return service.steps[project].process;
            case "inputs":
                return service._isFinishedIOStep(project, "inputSteps", step);
            case "outputs":
                return service._isFinishedIOStep(project, "outputSteps", step);
            default:
                return false;
            }
        },

        _findTemplate: function(templates, templateID) {
            var i = _.indexOf(templates, function(template) {
                return template.id == templateID;
            });

            return templates[i];
        },

        templateForStep: function(template, step) {
            switch (step.stepType) {
            case "inputs":
                return service._findTemplate(template.input_templates, step.step);
            case "outputs":
                return service._findTemplate(template.output_templates, step.step);
            case "process":
                return false;
            case "done":
                return false;
            default:
                return false;
            }
        },

        _makeStepTracker: function() {
            return {
                inputSteps: [],
                outputSteps: [],
                process: false,
                done: false,
                onLeave: null,
                lastStep: {
                    stepType: "",
                    step: ""
                },
                currentStep: {
                    stepType: "",
                    step: ""
                }
            };
        },

        resetProject: function(project) {
            service.steps[project] = service._makeStepTracker();
        },

        addProject: function(project) {
            if (project in service.steps) {
                return;
            }

            service.steps[project] = service._makeStepTracker();
        }

    };

    return service;
}
