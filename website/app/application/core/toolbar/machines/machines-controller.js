Application.Controllers.controller('toolbarMachines',
    ["$scope", "mcapi", "$injector", "Nav", function ($scope, mcapi, $injector, Nav) {
        var $validationProvider = $injector.get('$validation');

        $validationProvider.setExpression({
            range: function (value, min, max) {
                console.log(min);
                if (value > 10 && value < 100) {
                    return value;
                }
            }
        });

        $validationProvider.setDefaultMsg({
            range: {
                error: 'This should be in range',
                success: 'Thanks!'
            }
        });
        $scope.clear_machine = function () {
            mcapi('/templates')
                .argWithValue('filter_by', '"template_type":"machine"')
                .success(function (data) {
                    $scope.machine_template = data[0];
                    $scope.doc = {
                        name: '',
                        notes: [],
                        description: '',
                        default_properties: $scope.machine_template.default_properties,
                        added_properties: []
                    };
                }).jsonp();

            $scope.bk = {
                new_note: ''
            };
        };

        $scope.save = function (form) {
            var check = $validationProvider.checkValid(form);
            if (check === true) {
                mcapi('/machines/new')
                    .success(function (data) {
                        mcapi('/machines/%', data.id)
                            .success(function (machine_obj) {
                                $scope.mach = machine_obj;
                                $scope.machines_list.unshift(machine_obj);
                                $scope.clear_machine();
                                $scope.toggleCustom = false;
                                $scope.message = "Machine has been saved.";
                            })
                            .error(function (e) {

                            }).jsonp();
                    })
                    .error(function (e) {

                    }).post($scope.doc);
            } else {
                $validationProvider.validate(form);
            }
        };

        $scope.moreDetails = function (machine) {
            $scope.machine = machine;
            $scope.flag = false;
            if ((Object.keys($scope.machine.properties)).length === 0) {
                $scope.flag = true;
            }

        };

        function init() {
            Nav.setActiveNav('Machines');
            $scope.doc = {
                name: '',
                notes: [],
                description: '',
                default_properties: [],
                added_properties: []
            };
            $scope.bk = {
                new_note: ''
            };
            mcapi('/templates')
                .argWithValue('filter_by', '"template_type":"machine"')
                .success(function (data) {
                    $scope.machine_template = data[0];
                    $scope.doc.default_properties = $scope.machine_template.default_properties;
                    $scope.doc.template = $scope.machine_template;     // using list of  additional properties in directive through doc
                }).jsonp();

            mcapi('/machines')
                .success(function (data) {
                    $scope.machines_list = data;
                }).jsonp();

        }

        init();
    }])
;