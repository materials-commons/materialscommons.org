Application.Provenance.Controllers.controller('provenanceIOStepsIOStep',
    ["$scope", "ProvDrafts", "$stateParams", "mcapi",
        function ($scope, ProvDrafts, $stateParams, mcapi) {

            $scope.loadMaterials = function () {
                mcapi('/materials')
                    .success(function (data) {
                        $scope.materials = data;

                        if ($scope.doc.material) {
                            var i = _.indexOf($scope.materials, function (item) {
                                return (item.name === $scope.doc.material.name);
                            });

                            if (i !== -1) {
                                $scope.doc.material = $scope.materials[i];
                            }
                        }
                    }).jsonp();
            };

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