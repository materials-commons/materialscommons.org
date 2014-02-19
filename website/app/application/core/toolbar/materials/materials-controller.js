//Application.Controllers.controller('toolbarMaterials',
//    ["$scope", "mcapi", function ($scope, mcapi) {
//        mcapi('/materials')
//            .success(function (data) {
//                $scope.materials_list = data;
//            })
//            .error(function () {
//
//            }).jsonp();
//
//        $scope.clear_material = function () {
//            $scope.material = '';
//        };
//
//        $scope.save = function () {
//            var temp = $scope.material;
//            mcapi('/materials/new')
//                .success(function (data) {
//                    mcapi('/materials/%', data.id)
//                        .success(function (material_obj) {
//                            $scope.mat = material_obj;
//                            $scope.materials_list.unshift(material_obj);
//                        })
//                        .error(function (e) {
//
//                        }).jsonp();
//                    $scope.material = "";
//
//                })
//                .error(function (e) {
//                }).post(temp);
//        };
//
//        $scope.custom_property = function () {
//            if (!('model' in $scope.material)) {
//                $scope.material.model = [];
//            }
//            if ($scope.additional_prop || $scope.additional_prop === ' ') {
//                $scope.material.model.push({'name': $scope.additional_prop, 'value': ''});
//                $scope.additional_prop = '';
//            }
//
//        };
//    }]);

Application.Controllers.controller('toolbarMaterials',
    ["$scope", "mcapi", function ($scope, mcapi) {
        $scope.material = {
            "model": {
                "default": [],
                "additional": []
            }
        };

        mcapi('/templates')
            .argWithValue('filter_by', '"template_type":"material"')
            .success(function (data) {
                $scope.material_template = data[0];
                $scope.default_properties = $scope.material_template.model.default;
                $scope.additional_properties = $scope.material_template.model.additional;

            })
            .error(function (e) {

            }).jsonp();

        mcapi('/materials')
            .success(function (data) {
                $scope.materials_list = data;

            })
            .error(function (data) {
            }).jsonp();

        $scope.clear_material = function () {

            $scope.material = {
                "model": {
                    "default": [],
                    "additional": []
                }
            };
        };

        $scope.save = function () {
            $scope.material.model.default = $scope.default_properties;
            mcapi('/materials/new')
                .arg('order_by=birthtime')
                .success(function (data) {
                    mcapi('/materials/%', data.id)
                        .success(function (material_obj) {
                            $scope.mat = material_obj;
                            $scope.materials_list.unshift(material_obj);
                        })
                        .error(function (e) {

                        }).jsonp();
                    $scope.material = {
                        "model": {
                            "default": [],
                            "additional": []
                        }
                    };
                })
                .error(function (e) {

                }).post($scope.material);
        };

        $scope.add_property_to_machine = function () {
            if ($scope.p_name || $scope.p_name === ' ') {
                $scope.material.model.additional.push(JSON.parse($scope.p_name));
                $scope.p_name = '';
            }
            if ($scope.additional_prop || $scope.additional_prop === ' ') {
                $scope.material.model.additional.push({'name': $scope.additional_prop, 'value': '', 'value_choice': [],
                    'unit_choice': [], 'unit': '', 'required': 'False', "type": ""});
                $scope.additional_prop = '';
            }

        };
    }]);