Application.Provenance.Controllers.controller('provenanceIOStepsIOStep',
    ["$scope", "ProvDrafts", "$stateParams",
        function ($scope, ProvDrafts, $stateParams) {

            $scope.init = function () {
                $scope.stepName = $stateParams.iostep;
                if ($stateParams.iosteps === 'inputs') {
                    $scope.doc = ProvDrafts.current.attributes.input_conditions[$scope.stepName];
                } else {
                    $scope.doc = ProvDrafts.current.attributes.output_conditions[$scope.stepName];
                }

                $scope.defaultProperties = $scope.doc.model.default;
                $scope.additionalProperties = [];
                $scope.useExisting = "yes";
            };

            $scope.init();

            $scope.addAdditionalProperty = function () {
                $scope.doc.model.added_properties.push(JSON.parse($scope.additionalProperty));
            };

        }]);