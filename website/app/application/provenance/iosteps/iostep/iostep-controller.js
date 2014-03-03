Application.Provenance.Controllers.controller('provenanceIOStepsIOStep',
    ["$scope", "ProvDrafts", "$stateParams", "mcapi",
        function ($scope, ProvDrafts, $stateParams, mcapi) {

            $scope.update_sample = function () {
                $scope.doc.model = $scope.doc.sample.model;
                $scope.doc.owner = $scope.doc.sample.owner;
                $scope.doc.sample_id = $scope.doc.sample.id;
            }

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
                                if ($scope.doc.sample) {
                                    var j = _.indexOf($scope.samples_list, function (item) {
                                        return (item.id === $scope.doc.sample.id);
                                    });
                                    if (j !== -1) {
                                        $scope.doc.sample = $scope.samples_list[j];
                                        $scope.doc.model = $scope.doc.sample.model;
                                        $scope.doc.owner = $scope.doc.sample.owner;
                                        $scope.doc.sample_id = $scope.doc.sample.id;
                                    }
                                }
                            }
                        }
                    }).jsonp();
            };


            $scope.load_selected_samples = function () {
                mcapi('/samples')
                    .success(function (data) {
                        $scope.samples_list = data;
                    }).jsonp();
            }

            $scope.init = function () {
                $scope.stepName = $stateParams.iostep;
                if ($stateParams.iosteps === 'inputs') {
                    $scope.doc = ProvDrafts.current.attributes.input_conditions[$scope.stepName];
                } else {
                    $scope.doc = ProvDrafts.current.attributes.output_conditions[$scope.stepName];
                }

                if ($scope.doc.template_pick === 'material') {
                    $scope.load_selected_samples();
                    $scope.loadMaterials();
                }

                $scope.defaultProperties = $scope.doc.model.default;
                $scope.additionalProperties = [];
                $scope.useExisting = "yes";

            };

            $scope.init();
        }]);