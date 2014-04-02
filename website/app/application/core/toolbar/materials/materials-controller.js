Application.Controllers.controller('toolbarMaterials',
    ["$scope", "mcapi", "$injector", "User", "dateGenerate", function ($scope, mcapi, $injector, User, dateGenerate) {
        var $validationProvider = $injector.get('$validation');
        $scope.showForm = function () {
            $scope.default_properties = $scope.model.selected_treatment.model.default;
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
            $scope.doc.treatments[$scope.model.selected_treatment.template_name] = $scope.default_properties;
        };

        $scope.save = function (form) {
            var check = $validationProvider.checkValid(form);
            if (check === true) {
                mcapi('/materials/new')
                    .arg('order_by=birthtime')
                    .success(function (data) {
                        mcapi('/materials/%', data.id)
                            .success(function (material_obj) {
                                $scope.materials_list.unshift(material_obj);
                            })
                            .error(function (e) {
                            }).jsonp();
                        $scope.doc = {
                            name: '',
                            alloy: '',
                            notes: '',
                            treatments_order: [],
                            treatments: {
                            }
                        };
                        $scope.model = {
                            selected_treatment: '',
                            tab_details: []
                        };
                    })
                    .error(function (e) {

                    }).post($scope.doc);
            } else {
                $validationProvider.validate(form);
            }
        };
        $scope.setProperties = function () {
            $scope.doc.model.default_properties = $scope.model.classification.model;
        };
        $scope.showTreatmentDetails = function (material) {
            $scope.material = material;

        };
        $scope.add_notes = function () {
            $scope.doc.notes.push({'message': $scope.bk.new_note, 'who': User.u(), 'date': dateGenerate.new_date()});
            $scope.bk.new_note = "";
        };

        function init() {
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
                    $scope.material_templates = data;
                })
                .error(function (e) {

                }).jsonp();
            mcapi('/materials')
                .success(function (data) {
                    $scope.materials_list = data;
                })
                .error(function (data) {
                }).jsonp();
        }

        init();
    }]);