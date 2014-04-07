Application.Provenance.Controllers.controller('provenanceIOStepsIOStep',
    ["$scope", "ProvDrafts", "$stateParams", "mcapi", "Clone", "User",
        function ($scope, ProvDrafts, $stateParams, mcapi, Clone, User) {
            $scope.model = {
                additionalProperty: {}
            };

            $scope.pick_sample = function () {
                var i = _.indexOf($scope.samples_list, function (item) {
                    return (item.id === $scope.doc.sample.id);
                });

                if (i !== -1) {
                    $scope.doc.sample = $scope.samples_list[i];
                    //$scope.doc.model = $scope.doc.sample.model;
                    //$scope.doc.owner = $scope.doc.sample.owner;
                    //$scope.doc.sample_id = $scope.doc.sample.id;
                }
            };

            $scope.addAdditionalProperty = function () {
                $scope.doc.model.added_properties.push($scope.model.additionalProperty);
            };

            $scope.addCustomProperty = function () {
                $scope.doc.model.added_properties.push({'name': $scope.customPropertyName, 'value': $scope.customPropertyValue, "type": "text", 'unit': '', 'value_choice': [], 'unit_choice': [], 'required': false});
            };

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

            function init() {
                $scope.stepName = $stateParams.iostep;
                console.log($scope.stepName);
                if ($stateParams.iosteps === 'inputs') {
                    $scope.doc = ProvDrafts.current.attributes.input_conditions[$scope.stepName];

                } else {
                    $scope.doc = ProvDrafts.current.attributes.output_conditions[$scope.stepName];
                    //To check whether the input picked sample and output transformed sample are same or not
                    $scope.input_doc = ProvDrafts.current.attributes.input_conditions['Pick Sample'];
                    if ($scope.stepName === 'Transformed Sample') {
                        if ('sample' in $scope.doc) {
                            if ($scope.doc.sample.id === $scope.input_doc.sample.id) {

                            }
                            else {
                                $scope.doc = Clone.get_clone($scope.doc, ProvDrafts.current);
                                console.log($scope.doc);
                            }
                        } else {
                            $scope.doc = Clone.get_clone($scope.doc, ProvDrafts.current);

                        }


                    }
                }
                if ($scope.doc.template_pick === 'pick sample') {
                    $scope.load_all_samples();

                }
            }


            init();
        }]);