Application.Directives.directive('wizardStepDone', wizardStepDoneDirective);

function wizardStepDoneDirective() {
    return {
        scope: {},
        controller: "wizardStepDoneDirectiveController",
        restrict: "EA",
        templateUrl: "application/core/projects/directives/provenance/wizard-step-done.html"
    };
}

Application.Controllers.controller('wizardStepDoneDirectiveController',
                                   ["$scope", "provStep", "$stateParams",
                                    "Restangular", "User", "$timeout", "current",
                                    "projectState", "recent", wizardStepDoneDirectiveController]);
function wizardStepDoneDirectiveController($scope, provStep, $stateParams, Restangular, User,
                                           $timeout, current, projectState, recent) {
    var state = projectState.get($stateParams.id, $stateParams.sid);
    $scope.unfinishedSteps = [];
    function determineDoneState() {
        if (!state.currentDraft.process.done) {
            $scope.unfinishedSteps.push({
                stepType: "process",
                step: "process",
                name: state.selectedTemplate.template_name
            });
        }
        state.selectedTemplate.input_templates.forEach(function(t) {
            if (!state.currentDraft.inputs[t.id].done) {
                $scope.unfinishedSteps.push({
                    stepType: "inputs",
                    step: t.id,
                    name: "(I) " + t.template_name
                });
            }
        });

        if (state.selectedTemplate.required_input_files) {
            if (!state.currentDraft.inputs.files.done) {
                $scope.unfinishedSteps.push({
                    stepType: "inputs",
                    step: "files",
                    name: "(I) Files"
                });
            }
        }

        state.selectedTemplate.output_templates.forEach(function(t) {
            if (!state.currentDraft.outputs[t.id].done) {
                $scope.unfinishedSteps.push({
                    stepType: "outputs",
                    step: t.id,
                    name: "(O) " + t.template_name
                });
            }
        });

        if (state.selectedTemplate.required_output_files) {
            if (!state.currentDraft.outputs.files.done) {
                $scope.unfinishedSteps.push({
                    stepType: "outputs",
                    step: "files",
                    name: "(O) Files"
                });
            }
        }

        if ($scope.unfinishedSteps.length === 0) {
            state.currentDraft.completed = true;
        }
    }

    determineDoneState();

    $scope.gotoStep = function(stepType, stepName) {
        var step = provStep.makeStep(stepType, stepName);
        provStep.setStep($stateParams.id, step);
    };

    function closeProvenanceAction() {
        provStep.resetProject($stateParams.id);
        recent.delete($stateParams.id, $stateParams.sid);
        projectState.delete($stateParams.id, $stateParams.sid);
        recent.gotoLast($stateParams.id);
    }

    $scope.submit = function() {
        Restangular.one("provenance2")
            .post($stateParams.id,
                  state.currentDraft,
                  {apikey: User.apikey()})
            .then(function(process) {
                var project = current.project();
                // At this point the new process may have relationships
                // with the existing processes. This is not currently
                // reflected. The work around at the moment is to
                // rebuild the list of processes. This is kind of ugly
                // but works at the moment.
                Restangular.one('processes').one('project', project.id)
                    .getList().then(function(processes){
                        project.processes = processes;
                        closeProvenanceAction();
                    });
            });
    };

    function updateDraft(draft) {
        var project = current.project();
        if (!('id' in state.currentDraft)) {
            // New draft so add it to the list.
            project.drafts.push(draft);
        } else {
            // we are working with an existing draft so
            // update that item in the list.
            var i = _.indexOf(project.drafts, function(d) {
                return d.id === draft.id;
            });
            if (i !== -1) {
                // if i === -1 then we are in trouble.
                project.drafts[i] = draft;
            }
        }
    }

    $scope.saveDraft = function() {
        var apikey = {apikey: User.apikey()};
        Restangular.one("drafts2")
            .post($stateParams.id, state.currentDraft, apikey)
            .then(function(draft) {
                updateDraft(draft);
                closeProvenanceAction();
            });
    };

    $scope.cancel = function() {
        // The bootstrap modal black backdrop isn't dismissed
        // if we don't wrap these functions in a timeout. It
        // appears that the changes to the dom are happening
        // too quickly.
        $timeout(function() {
            recent.delete($stateParams.id, $stateParams.sid);
            projectState.delete($stateParams.id, $stateParams.sid);
            closeProvenanceAction();
        }, 100);
    };
}
