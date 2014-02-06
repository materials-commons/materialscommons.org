function CreateNewMachineController($scope, mcapi) {

    mcapi('/templates')
        .argWithValue('filter_by', '"template_type":"machine"')
        .success(function (data) {
            $scope.machine_template = data[0];
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
        $scope.machine = '';
    }


    $scope.save = function () {
        var new_machine = $scope.machine;
        console.log(new_machine);
        mcapi('/machines/new')
            .success(function (data) {
                mcapi('/machines/%', data.id)
                    .success(function (machine_obj) {
                       $scope.mach = machine_obj;
                       $scope.machines_list.push(machine_obj)
                    })
                    .error(function (e) {

                    }).jsonp();
                $scope.machine = "";
            })
            .error(function (e) {

            }).post(new_machine);
    }

    $scope.add_property_to_machine = function () {
        if (!('model' in $scope.machine)) {
            $scope.machine.model = [];
        }
        if ($scope.p_name || $scope.p_name == ' ') {
            $scope.machine.model.push({'name': $scope.p_name, 'value': ''});
            $scope.p_name = '';
        }

    }
    $scope.custom_property = function () {
        if (!('model' in $scope.machine)) {
            $scope.machine.model = [];
        }
        if ($scope.additional_prop || $scope.additional_prop == ' ') {
            $scope.machine.model.push({'name': $scope.additional_prop, 'value': ''})
            $scope.additional_prop = '';
        }

    }


}