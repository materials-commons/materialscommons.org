Application.Controllers.controller('projectsProvenance',
    ["$scope", "$state", "$stateParams", "ProvSteps", "ProvDrafts", "process.Model", "Projects", "ProjectPath",
        function ($scope, $state, $stateParams, ProvSteps, ProvDrafts, Model, Projects, ProjectPath) {
            $scope.isCurrentStep = function (step) {
                return ProvSteps.isCurrentStep(step);
            };
            $scope.isFinishedStep = function (step) {
                if (step == 'process') {
                    $scope.provenanceView = ProvDrafts.current.process;
                }
                if (step == 'inputs') {
                    $scope.inputs = ProvDrafts.current.process.input_conditions;
                    $scope.input_files = ProvDrafts.current.process.input_files;
                }
                if (step == 'outputs') {
                    $scope.outputs = ProvDrafts.current.process.output_conditions;
                    $scope.output_files = ProvDrafts.current.process.output_files;
                }
                return ProvSteps.isFinishedStep(step);
            };
            $scope.editStep = function (step) {
                var state;
                switch (step) {
                    case "process":
                        state = 'projects.provenance.process';
                        break;
                    case "inputs":
                        state = 'projects.provenance.iosteps';
                        break;
                    case "outputs":
                        state = 'projects.provenance.iosteps';
                        break;
                    case "submit":
                        state = 'projects.provenance.finish';
                        break;
                }
                ProvSteps.setCurrentStep(step);
                if (step === "inputs" || step === "outputs") {
                    $state.go(state, {iosteps: step});
                } else {
                    $state.go(state);
                }
            };
            $scope.stepFinished = function (step) {
                switch (step) {
                    case "process":
                        ProvSteps.setCurrentStep('inputs');
                        $state.go('projects.provenance.iosteps', {iosteps: 'inputs'});
                        break;
                    case "inputs":
                        ProvSteps.setCurrentStep('outputs');
                        $state.go('projects.provenance.iosteps', {iosteps: 'outputs'});
                        break;
                    case "outputs":
                        ProvSteps.setCurrentStep('submit');
                        $state.go('projects.provenance.finish');
                        break;
                    default:
                        $state.go('projects.provenance.process');
                        break;
                }
            };
            $scope.markAllStepsFinished = function () {
                ProvSteps.setStepFinished('process');
                ProvSteps.setStepFinished('inputs');
                ProvSteps.setStepFinished('outputs');
                ProvSteps.setStepFinished('submit');
            };
            function init() {
                var draft;
                // Reset steps state
                ProvSteps.clear();
                if ($stateParams.draft_id !== "") {
                    draft = ProvDrafts.findDraft($stateParams.draft_id);
                    $scope.markAllStepsFinished();
                } else {
                    draft = ProvDrafts.newDraft();
                    if (!($stateParams.id)) {
                        $stateParams.id = ProjectPath.get_project();
                    }
                    draft.project_id = $stateParams.id;
                    draft.process = Model.newProcess();
                    draft.project_name = Projects.model.projects[draft.project_id].dir.name;
                }
                ProvDrafts.current = draft;
                $scope.project_id = $stateParams.id;
                ProvSteps.setCurrentStep('process');
                ProvSteps.onStepFinished($scope.stepFinished);
                $state.go('projects.provenance.process');
            }
            init();
        }]);
