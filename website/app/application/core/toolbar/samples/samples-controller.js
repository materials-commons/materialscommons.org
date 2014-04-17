Application.Controllers.controller('toolbarSamples',
    ["$scope", "mcapi", "$injector", "User", "dateGenerate", function ($scope, mcapi, $injector, User, dateGenerate) {
        $scope.showForm = function () {
            $scope.default_properties = $scope.bk.selected_treatment.default_properties;
            $scope.bk.tab_item = '';
        };

        $scope.showTab = function (item) {
            $scope.bk.tab_item = item;
            $scope.bk.tab_details = $scope.doc.treatments[item];
            $scope.default_properties = $scope.doc.treatments[item];
            $scope.bk.selected_treatment = {};
        };

        $scope.addTreatment = function () {
            $scope.doc.treatments_order.push($scope.bk.selected_treatment.template_name);
            $scope.default_properties.forEach(function (item) {

            });
            $scope.doc.treatments[$scope.bk.selected_treatment.template_name] = $scope.default_properties;
        };

        $scope.save = function (form) {
            var $validationProvider = $injector.get('$validation');
            var check = $validationProvider.checkValid(form);
            if (check === true) {
                mcapi('/samples/new')
                    .arg('order_by=birthtime')
                    .success(function (data) {
                        mcapi('/samples/%', data.id)
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
                treatments_order: [],
                treatments: {
                },
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
            mcapi('/samples')
                .success(function (data) {
                    $scope.samples_list = data;
                })
                .error(function (data) {
                }).jsonp();
        }

        init();
    }]);
