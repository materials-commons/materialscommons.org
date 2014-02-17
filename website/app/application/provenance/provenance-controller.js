Application.Provenance.Controllers.controller('provenance',
    ["$scope", "$state", "$stateParams", "ProvSteps", "ProvDrafts",
        function ($scope, $state, $stateParams, ProvSteps, ProvDrafts) {

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
                var draft = ProvDrafts.newDraft();
                draft.attributes.project_id = $stateParams.id;
                ProvDrafts.current = draft;
                ProvSteps.clear();
                ProvSteps.setCurrentStep('process');
                ProvSteps.onStepFinished($scope.stepFinished);
                $state.go('toolbar.projectspage.provenance.process');
            };

            $scope.init();
        }]);