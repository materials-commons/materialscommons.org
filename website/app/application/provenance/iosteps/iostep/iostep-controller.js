Application.Provenance.Controllers.controller('provenanceIOStepsIOStep',
    ["$scope", "ProvDrafts", "$stateParams", "mcapi",
        function ($scope, ProvDrafts, $stateParams, mcapi) {

            $scope.addAdditionalProperty = function () {
                $scope.doc.model.added_properties.push(JSON.parse($scope.additionalProperty));
            };

            $scope.loadMaterials = function () {
                mcapi('/materials')
                    .success(function (data) {
                        $scope.materials = data;
                    }).jsonp();
            };

            $scope.materialSelect = function (material) {
                $scope.doc.material = material;
            }

            $scope.init = function () {
                $scope.stepName = $stateParams.iostep;
                if ($stateParams.iosteps === 'inputs') {
                    $scope.doc = ProvDrafts.current.attributes.input_conditions[$scope.stepName];
                } else {
                    $scope.doc = ProvDrafts.current.attributes.output_conditions[$scope.stepName];
                }

                if ($scope.doc.template_pick === 'material') {
                    $scope.loadMaterials();
                }

                $scope.defaultProperties = $scope.doc.model.default;
                $scope.additionalProperties = [];
                $scope.useExisting = "yes";
            };

            $scope.init();
        }]);