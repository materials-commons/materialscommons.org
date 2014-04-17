Application.Controllers.controller('toolbarMachines',
    ["$scope", "mcapi", "$injector", function ($scope, mcapi, $injector) {
        var $validationProvider = $injector.get('$validation');
        $scope.clear_machine = function () {
            $scope.doc = {
                name: '',
                notes: [],
                description: '',
                default_properties: [],
                added_properties: []
            };
            $scope.bk = {
                new_note: '',
                additional_property: '',
                customPropertyName: '',
                customPropertyValue: ''
            };
        };

        $scope.save = function (form) {
            var check = $validationProvider.checkValid(form);
            if (check === true) {
                mcapi('/machines/new')
                    .arg('order_by=birthtime')
                    .success(function (data) {
                        mcapi('/machines/%', data.id)
                            .success(function (machine_obj) {
                                $scope.mach = machine_obj;
                                $scope.machines_list.unshift(machine_obj);
                            })
                            .error(function (e) {

                            }).jsonp();
                    })
                    .error(function (e) {

                    }).post($scope.machine);
            } else {
                $validationProvider.validate(form);
            }

        };

        function init() {
            $scope.doc = {
                name: '',
                notes: [],
                description: '',
                default_properties: [],
                added_properties: []
            };
            $scope.bk = {
                new_note: '',
                additional_property: '',
                customPropertyName: '',
                customPropertyValue: ''
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
    }]);