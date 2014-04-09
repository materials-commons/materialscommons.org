Application.Controllers.controller('toolbarSamples',
    ["$scope", "mcapi", "$injector", "User", "dateGenerate", function ($scope, mcapi, $injector, User, dateGenerate) {
        $scope.showForm = function () {
            $scope.default_properties = $scope.model.selected_treatment.default_properties;
            $scope.model.tab_item = '';
        };

        $scope.showTab = function (item) {
            $scope.model.tab_item = item;
            $scope.model.tab_details = $scope.doc.treatments[item];
            $scope.default_properties = $scope.doc.treatments[item];
            $scope.model.selected_treatment = {};
        };

        $scope.addTreatment = function () {
            $scope.doc.treatments_order.push($scope.model.selected_treatment.template_name);
            $scope.default_properties.forEach(function (item) {

            });
            $scope.doc.treatments[$scope.model.selected_treatment.template_name] = $scope.default_properties;
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
            $scope.doc.model.default_properties = $scope.model.classification.default_properties;
        };
        $scope.showTreatmentDetails = function (sample) {
            $scope.sample = sample;

        };
        $scope.add_notes = function () {
            $scope.doc.notes.push({'message': $scope.bk.new_note, 'who': User.u(), 'date': dateGenerate.new_date()});
            $scope.bk.new_note = "";
        };

        $scope.clear = function () {
            $scope.doc = {
                name: '',
                alloy: '',
                notes: [],
                treatments_order: [],
                treatments: {
                },
                model: {
                    default_properties: [],
                    added_properties: []
                }
            };
            $scope.model = {
                selected_treatment: '',
                tab_details: [],
                tab_item: '',
                classification: ''
            };
            $scope.bk = {
                new_note: ''
            };
        };

        function init() {
            $scope.clear();
            mcapi('/templates')
                .argWithValue('filter_by', '"template_type":"treatment"')
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
