Application.Provenance.Controllers.controller('provenanceInputsInput',
    ["$scope", "ProvDrafts", "$stateParams",
        function ($scope, ProvDrafts, $stateParams) {

            $scope.init = function () {
                console.log("provenanceInputsInput.init() called");
                $scope.stepName = $stateParams.step;
                $scope.doc = ProvDrafts.current.attributes.input_conditions[$scope.stepName];
                console.dir($scope.doc);
            };

            $scope.init();

        }]);