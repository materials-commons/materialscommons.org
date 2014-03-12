Application.Provenance.Controllers.controller('provenanceIOStepsIOStep',
    ["$scope", "ProvDrafts", "$stateParams", "mcapi",
        function ($scope, ProvDrafts, $stateParams, mcapi) {
            $scope.model = {
                additionalProperty: {},
                pick_sample: {}
            };

            $scope.pick_sample = function () {
                var i = _.indexOf($scope.samples_list, function (item) {
                    return (item.id === $scope.doc.sample.id);
                });

                if (i !== -1) {
                    $scope.doc.sample = $scope.samples_list[i];
                    $scope.doc.model = $scope.doc.sample.model;
                    $scope.doc.owner = $scope.doc.sample.owner;
                    $scope.doc.sample_id = $scope.doc.sample.id;
                }
            };

            $scope.addAdditionalProperty = function () {
                $scope.doc.model.added_properties.push($scope.model.additionalProperty);
            };

            $scope.addCustomProperty = function () {
                $scope.doc.model.added_properties.push({'name': $scope.customPropertyName, 'value': $scope.customPropertyValue, 'unit': '', 'value_choice': [], 'unit_choice': []});
            };

//            $scope.loadMaterials = function () {
//                mcapi('/materials')
//                    .success(function (data) {
//                        $scope.materials = data;
//
//                        if ($scope.doc.material) {
//                            var i = _.indexOf($scope.materials, function (item) {
//                                return (item.name === $scope.doc.material.name);
//                            });
//
//                            if (i !== -1) {
//                                $scope.doc.material = $scope.materials[i];
//                                if ($scope.doc.sample) {
//                                    var j = _.indexOf($scope.samples_list, function (item) {
//                                        return (item.id === $scope.doc.sample.id);
//                                    });
//                                    if (j !== -1) {
//                                        $scope.doc.sample = $scope.samples_list[j];
//                                        $scope.doc.model = $scope.doc.sample.model;
//                                        $scope.doc.owner = $scope.doc.sample.owner;
//                                        $scope.doc.sample_id = $scope.doc.sample.id;
//                                    }
//                                }
//                            }
//                        }
//                    }).jsonp();
//            };

            $scope.load_all_samples = function () {
                mcapi('/samples')
                    .success(function (data) {
                        $scope.samples_list = data;
                        if ($scope.doc.sample) {
                            var i = _.indexOf($scope.samples_list, function (item) {
                                return (item.id === $scope.doc.sample.id);
                            });

                            if (i !== -1) {
                                $scope.doc.sample = $scope.samples_list[i];
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
                if ($scope.doc.template_pick === 'sample') {
                    $scope.load_all_samples();

                }
            };

            $scope.init();
        }
    ])
;