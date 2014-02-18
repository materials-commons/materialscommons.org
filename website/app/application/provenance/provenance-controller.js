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
                console.log("stepFinished = " + step);
            };

            $scope.init = function () {
                var draft;

                if ($stateParams.draft_id !== "") {
                    draft = ProvDrafts.findDraft($stateParams.draft_id);
                } else {
                    draft = ProvDrafts.newDraft();
                    draft.attributes.project_id = $stateParams.id;
                    draft.process = Model.newProcess();
                }
                ProvDrafts.current = draft;
                ProvSteps.clear();
                ProvSteps.setCurrentStep('process');
                ProvSteps.onStepFinished($scope.stepFinished);
                $state.go('toolbar.projectspage.provenance.process');
            };

            $scope.init();
        }]);