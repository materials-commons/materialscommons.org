Application.Provenance.Controllers.controller('provenance',
    ["$scope", "$state", "$stateParams", "ProvSteps", "ProvDrafts", "Model",
        function ($scope, $state, $stateParams, ProvSteps, ProvDrafts, Model) {

            $scope.isCurrentStep = function (step) {
                return ProvSteps.isCurrentStep(step);
            };

            $scope.isFinishedStep = function (step) {
                return ProvSteps.isFinishedStep(step);
            };

            $scope.editStep = function (step) {

            };

            $scope.stepFinished = function (step) {
                switch (step) {
                case "process":
                    $state.go('toolbar.projectspage.provenance.inputs');
                    break;
                case "inputs":
                    $state.go('toolbar.projectspage.provenance.outputs');
                    break;
                case "outputs":
                    $state.go('toolbar.projectspage.provenance.finish');
                    break;
                default:
                    $state.go('toolbar.projectspage.provenance.process');
                    break;
                }
            };

            $scope.init = function () {
                var draft;

                if ($stateParams.draft_id !== "") {
                    draft = ProvDrafts.findDraft($stateParams.draft_id);
                } else {
                    draft = ProvDrafts.newDraft();
                    draft.attributes.project_id = $stateParams.id;
                    draft.attributes.process = Model.newProcess();
                }
                ProvDrafts.current = draft;
                ProvSteps.clear();
                ProvSteps.setCurrentStep('process');
                ProvSteps.onStepFinished($scope.stepFinished);
                $state.go('toolbar.projectspage.provenance.process');
            };

            $scope.init();
        }]);