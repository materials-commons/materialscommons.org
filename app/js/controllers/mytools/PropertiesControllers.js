function MaterialConditionsController($scope, mcapi, User, alertService, decodeAlerts, $rootScope) {

    $scope.add_mc_conditions = function () {
        var mc = {};
        mc.name = $scope.name;
        mc.alloy_name = $scope.alloy_name;
        mc.alloy_name_notes = $scope.alloy_name_notes;
        mc.known_composition = $scope.known_composition;
        mc.known_composition_notes = $scope.known_composition_notes;
        mc.manufacturing_condition = $scope.manufacturing_condition;
        mc.manufacturing_condition_notes = $scope.manufacturing_condition_notes;
        mc.heat_treatment = $scope.heat_treatment;
        mc.heat_treatment_notes = $scope.heat_treatment_notes;
        //console.dir(mc);
        mcapi('/user/%/material_conditions', User.u())
            .success(function () {
                mcapi('/user/%/material_conditions', User.u())
                    .success(function (data) {
                        $rootScope.material_conditions = data;

                    }).jsonp();
                $scope.msg = "material conditions have been added to the list"
                alertService.prepForBroadcast($scope.msg);

            })
            .error(function (data) {
                $scope.msg = decodeAlerts.get_alert_msg(data.error);
                alertService.prepForBroadcast($scope.msg);
            }).post(mc);

    }

    $scope.add_equipment_conditions = function () {
        var ec = {};
        ec.name = $scope.name;
        ec.equipment_type = $scope.equipment_type;
        ec.microscope_mfg = $scope.microscope_mfg;
        ec.microscope_mfg_notes = $scope.microscope_mfg_notes;
        ec.microscope_model = $scope.microscope_model;
        ec.manufacturing_condition_notes = $scope.manufacturing_condition_notes;
        ec.voltage = $scope.voltage;
        ec.voltage_notes = $scope.voltage_notes;

        ec.mode = $scope.mode;
        ec.mode_notes = $scope.mode_notes;
        ec.field = $scope.field;
        ec.field_notes = $scope.field_notes;
        ec.specimen_prep = $scope.specimen_prep;
        ec.specimen_prep_notes = $scope.specimen_prep_notes;
        ec.microscope_type = $scope.microscope_type;
        ec.microscope_type_notes = $scope.microscope_type_notes;

        ec.temp = $scope.temp;
        ec.temp_notes = $scope.temp_notes;
        ec.pulse_frequency = $scope.pulse_frequency;
        ec.pulse_frequency_notes = $scope.pulse_frequency_notes;
        ec.current = $scope.current;
        ec.current_notes = $scope.current_notes;

        mcapi('/user/%/equipment_conditions', User.u())
            .success(function (data) {
                $scope.msg = "equipment properties have been added to the list"
                alertService.prepForBroadcast($scope.msg);
            })
            .error(function (data) {
                $scope.msg = decodeAlerts.get_alert_msg(data.error);
                alertService.prepForBroadcast($scope.msg);
            }).post(ec);

    }
}