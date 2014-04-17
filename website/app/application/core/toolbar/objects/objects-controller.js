Application.Controllers.controller('toolbarObjects',
    ["$scope", "mcapi", "$injector", function ($scope, mcapi, $injector) {
        $scope.showForm = function () {
            $scope.default_properties = $scope.bk.selected_treatment.default_properties;
            $scope.bk.tab_item = '';
        };

        $scope.showTab = function (item, index) {
            $scope.bk.tab_item = item;
            $scope.bk.tab_details = $scope.doc.treatments[index];
            $scope.default_properties = $scope.doc.treatments[index];
            $scope.bk.selected_treatment = {};
        };

        function clearTreatment(treatment) {
            treatment.additional_properties.forEach(function(attr) {
                attr.value = "";
                if (attr.unit_choice.length > 0) {
                    attr.unit = "";
                }
            });

            treatment.default_properties.forEach(function(attr) {
                attr.value = "";
                if (attr.unit_choice.length > 0) {
                    attr.unit = "";
                }
            });
        }

        $scope.addTreatment = function () {
            var o = angular.copy($scope.bk.selected_treatment);
            clearTreatment($scope.bk.selected_treatment);
            $scope.bk.selected_treatment = '';
            $scope.default_properties = "";
            $scope.doc.treatments.push(o);
        };

        $scope.save = function (form) {
            var $validationProvider = $injector.get('$validation');
            var check = $validationProvider.checkValid(form);
            if (check === true) {
                mcapi('/objects/new')
                    .arg('order_by=birthtime')
                    .success(function (data) {
                        mcapi('/objects/%', data.id)
                            .success(function (sample_obj) {
                                $scope.samples_list.unshift(sample_obj);
                            })
                            .error(function (e) {
                            }).jsonp();
                        $scope.clear();
                    })
                    .error(function (e) {

                    }).post($scope.doc);
            } else {
                $validationProvider.validate(form);
            }
        };
        $scope.setProperties = function () {
            $scope.doc.default_properties = $scope.bk.classification.default_properties;

        };
        $scope.showTreatmentDetails = function (sample) {
            $scope.sample = sample;

        };

        $scope.clear = function () {
            $scope.doc = {
                name: '',
                composition: '',
                notes: [],
                treatments: [],
                available: true,
                default_properties: [],
                added_properties: []
            };
            $scope.bk = {
                selected_treatment: '',
                tab_details: [],
                tab_item: '',
                classification: '',
                new_note: ''
            };
        };

        function init() {
            $scope.clear();
            mcapi('/templates')
                .argWithValue('filter_by', '"template_pick":"treatment"')
                .success(function (data) {
                    $scope.treatment_templates = data;
                })
                .error(function (e) {

                }).jsonp();
            mcapi('/templates')
                .argWithValue('filter_by', '"template_type":"material"')
                .success(function (data) {
                    $scope.sample_templates = data;
                })
                .error(function (e) {

                }).jsonp();
            mcapi('/objects')
                .success(function (data) {
                    $scope.samples_list = data;
                })
                .error(function (data) {
                }).jsonp();
        }

        init();
    }]);
