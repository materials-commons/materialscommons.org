Application.Provenance.Controllers.controller('provenanceInputsInput',
    ["$scope", "ProvDrafts", "$stateParams",
        function ($scope, ProvDrafts, $stateParams) {

            $scope.init = function () {
                $scope.stepName = $stateParams.step;
                $scope.doc = ProvDrafts.current.attributes.input_conditions[$scope.stepName];
                $scope.defaultProperties = $scope.doc.model.default;
                $scope.additionalProperties = $scope.doc.model.additional;
                $scope.doneName = "Done";
            };

            $scope.init();

        }]);