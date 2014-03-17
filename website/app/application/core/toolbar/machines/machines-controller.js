Application.Controllers.controller('toolbarMachines',
    ["$scope", "mcapi", "$injector", function ($scope, mcapi, $injector) {
        $scope.machine = {
            "additional": []
        };

        mcapi('/templates')
            .argWithValue('filter_by', '"template_type":"machine"')
            .success(function (data) {
                $scope.machine_template = data[0];
                $scope.default_properties = $scope.machine_template.model.default;
                $scope.additional_properties = $scope.machine_template.model.additional;
            })
            .error(function (e) {

            }).jsonp();

        mcapi('/machines')
            .success(function (data) {
                $scope.machines_list = data;
            })
            .error(function (data) {
            }).jsonp();

        $scope.clear_machine = function () {

            $scope.machine = {
                "additional": []

            };
        };

        $scope.save = function (doc) {
            var $validationProvider = $injector.get('$validation');
            var check = $validationProvider.checkValid(doc);
            console.log(check);
            $validationProvider.validate($scope.default_properties);

            $scope.default_properties.forEach(function (item) {
                $scope.machine[item.name] = item.value;
            });
//            mcapi('/machines/new')
//                .arg('order_by=birthtime')
//                .success(function (data) {
//                    mcapi('/machines/%', data.id)
//                        .success(function (machine_obj) {
//                            $scope.mach = machine_obj;
//                            $scope.machines_list.unshift(machine_obj);
//                        })
//                        .error(function (e) {
//
//                        }).jsonp();
//                    $scope.machine = {
//                        "additional": []
//                    };
//                })
//                .error(function (e) {
//
//                }).post($scope.machine);
        };

        $scope.add_property_to_machine = function () {
            if ($scope.p_name || $scope.p_name === ' ') {
                $scope.machine.additional.push(JSON.parse($scope.p_name));
                $scope.p_name = '';
            }
            if ($scope.additional_prop || $scope.additional_prop === ' ') {
                $scope.machine.additional.push({'name': $scope.additional_prop, 'value': '', 'value_choice': [],
                    'unit_choice': [], 'unit': '', 'required': 'False', "type": "text"});
                $scope.additional_prop = '';
            }

        };
    }]);