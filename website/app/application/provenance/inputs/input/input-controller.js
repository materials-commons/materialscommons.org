Application.Provenance.Controllers.controller('provenanceInputsInput',
    ["$scope", "ProvDrafts", "$stateParams",
        function ($scope, ProvDrafts, $stateParams) {

            $scope.init = function () {
                $scope.stepName = $stateParams.step;
                $scope.doc = ProvDrafts.current.attributes.input_conditions[$scope.stepName];
                $scope.defaultProperties = $scope.doc.model.default;
                $scope.additionalProperties = [];
                $scope.doneName = "Done";
                $scope.useExisting = "yes";
            };

            $scope.init();

            $scope.addAdditionalProperty = function () {
                $scope.doc.model.added_properties.push(JSON.parse($scope.additionalProperty));
            };

        }]);