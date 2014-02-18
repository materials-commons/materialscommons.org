Application.Provenance.Controllers.controller('provenanceInputsInput',
    ["$scope", "ProvDrafts", "$stateParams",
        function ($scope, ProvDrafts, $stateParams) {

            $scope.init = function () {
                console.log("provenanceAppInputsInput.init() called");
                $scope.stepName = $stateParams.step;
                $scope.doc = ProvDrafts.current.attributes.input_conditions[$scope.stepName];
            };

            $scope.init();

        }]);