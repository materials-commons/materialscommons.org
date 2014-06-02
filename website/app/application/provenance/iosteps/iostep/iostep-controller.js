Application.Provenance.Controllers.controller('provenanceIOStepsIOStep',
    ["$scope", "ProvDrafts", "$stateParams", "mcapi", "Clone", "watcher", "$filter", "User",
        function ($scope, ProvDrafts, $stateParams, mcapi, Clone, watcher, $filter, User) {
            $scope.pick_sample = function () {
                var i = _.indexOf($scope.samples_list, function (item) {
                    return (item.id === $scope.doc.sample.id);
                });
                if (i !== -1) {
                    $scope.doc.sample = $scope.samples_list[i];
                }
            };

            $scope.addAdditionalProperty = function () {
                $scope.doc.added_properties.push($scope.model.additionalProperty);
            };

            $scope.addCustomProperty = function () {
                $scope.doc.added_properties.push({'name': $scope.customPropertyName, 'value': $scope.customPropertyValue, "type": "text", 'unit': '', 'value_choice': [], 'unit_choice': [], 'required': false});
            };

            $scope.set_availability = function () {
                if ($scope.bk.available === "1") {
                    $scope.doc.is_active = true;
                }
                if ($scope.bk.available === "2") {
                    $scope.doc.is_active = false;
                }
            };

            $scope.load_all_samples = function () {
                mcapi('/objects/user/%', User.u())
                    .success(function (data) {
                        $scope.samples_list = $filter('available')(data);

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
                $scope.bk = {
                    available: "1",
                    additional_property: '',
                    customPropertyName: '',
                    customPropertyValue: ''

                };
                $scope.stepName = $stateParams.iostep;
                if ($stateParams.iosteps === 'inputs') {
                    $scope.doc = ProvDrafts.current.process.input_conditions[$scope.stepName];

                } else {
                    $scope.doc = ProvDrafts.current.process.output_conditions[$scope.stepName];
                    //To check whether the input picked sample and output transformed sample are same or not
                    $scope.input_doc = ProvDrafts.current.process.input_conditions['Pick Sample'];
                    if ($scope.stepName === 'Transformed Sample') {
                        if ('sample' in $scope.doc) {
                            if (!($scope.doc.sample.id === $scope.input_doc.sample.id)) {
                                $scope.doc = Clone.get_clone($scope.doc, ProvDrafts.current);
                            }
                            if ($scope.doc.is_active === true) {
                                $scope.bk.available = "1";
                            } else {
                                $scope.bk.available = "2";
                            }
                        } else {
                            $scope.doc = Clone.get_clone($scope.doc, ProvDrafts.current);
                        }
                    }
                }
                if ($scope.doc.template_pick === 'pick_sample') {
                    $scope.load_all_samples();
                }
            }

            init();
        }]);
