function OutputStepController($scope, trackSavedProv, mcapi, wizard, Stater, treeToggle, alertService, $dialog) {

    mcapi('/materials')
        .success(function (data) {
            $scope.materials = data;
        })
        .error(function () {

        }).jsonp()

    $scope.material_select = function () {
        var material = JSON.parse($scope.material_selected)
        $scope.condition.material = material;
    }

    $scope.clear_material = function () {
        $scope.condition.material = {};
        $scope.material_added = false;
    }

    $scope.add_material_to_db = function () {
        var temp = $scope.condition.material;
        mcapi('/materials/new')
            .success(function (data) {
                $scope.material_added = true;
                $scope.myradio = 'select';

            })
            .error(function (e) {
            }).post(temp);
    }


    $scope.init = function (condition_name) {
        $scope.condition_name = condition_name;
        var name = '"' + $scope.condition_name + '"';
        mcapi('/templates')
            .argWithValue('filter_by', '"template_name":' + name)
            .success(function (condition) {
                $scope.condition = condition[0];
                mcapi('/conditions/template/%', $scope.condition.id)
                    .success(function (data) {
                        $scope.existing_conditions = data;

                    })
                    .error(function (e) {
                    }).jsonp();
            })
            .error(function () {
                alertService.sendMessage("Failed looking up: " + $scope.condition_name);
            }).jsonp();
    }

    $scope.selected_condition = function (cond) {
        var now = new Date();
        var dd = ("0" + now.getDate()).slice(-2);
        var mm = ("0" + (now.getMonth() + 1)).slice(-2);
        var today = now.getFullYear() + "-" + (mm) + "-" + (dd);
        var make_name = cond.name + ':' + today
        $scope.selected_cond = cond;
        $scope.condition.name = make_name
        $scope.condition.description = cond.description
        $scope.condition.model = cond.model
        if (cond.material) {
            $scope.condition.material = cond.material;
        }
        else {
            $scope.condition.material = {};
        }

    }

    $scope.clear_condition = function () {
        $scope.condition.name = '';
        $scope.condition.description = '';
        $scope.condition.model.forEach(function (property) {
            property.value = '';
            property.unit = '';

        });
        $scope.use_condition = '';
        $scope.condition.material = '';

    }
    $scope.custom_property = function () {
        if ($scope.additional_prop || $scope.additional_prop == ' ') {
            $scope.condition.model.push({'name': $scope.additional_prop, 'value': '', 'value_choice': [], 'unit': '', 'unit_choice': [], 'type': ''})
        }
    }

    $scope.save_condition = function () {
        $scope.state = Stater.retrieve();
        if (!('output_conditions' in $scope.state.attributes)) {
            $scope.state.attributes.output_conditions = {};
            Stater.save($scope.state);

        }

        $scope.state.attributes.output_conditions[$scope.condition_name] = $scope.condition;
        Stater.save($scope.state);
        $scope.showDetails = false;
    }

    /**
     * Output Files
     */
    $scope.add_output_files = function () {
        $scope.checked_ids = [];
        $scope.item_names = [];
        $scope.checked_items = treeToggle.get_all_checked_items();
        if ($scope.checked_items.length == 0) {
            var title = '';
            var msg = 'Please select files from tree below ';
            var btns = [
                {result: 'close', label: 'close', cssClass: 'btn-primary'}
            ];

            $dialog.messageBox(title, msg, btns)
                .open()
                .then(function (result) {

                })
        }
        $scope.state = Stater.retrieve();
        if (!('output_files' in $scope.state.attributes)) {
            $scope.state.attributes.output_files = {};
            $scope.state.attributes.checked_output_filenames = {};

        }
        else {
            $scope.checked_ids = $scope.state.attributes.output_files;
            $scope.item_names = $scope.state.attributes.checked_output_filenames;
        }

        $scope.checked_items = treeToggle.get_all_checked_items();
        $scope.checked_items.forEach(function (item) {
            if (!($scope.checked_ids.indexOf(item.id) > -1)) {
                $scope.checked_ids.push(item.id)
                $scope.item_names.push(item)
            }

        })


        $scope.state.attributes.output_files = $scope.checked_ids;
        //to display names of the files in verify and submit
        $scope.state.attributes.checked_output_filenames = $scope.item_names;
        Stater.save($scope.state);
    }


    $scope.verify_outputs = function () {
        $scope.state = Stater.retrieve();
        if ($scope.state.attributes.process.required_output_conditions.length == 0) {
            $scope.verified = true;
            $scope.warning = false;
        }
        else {
            if ($scope.state.attributes.output_conditions) {
                if ((Object.keys($scope.state.attributes.output_conditions).length) == (($scope.state.attributes.process.required_output_conditions).length)) {
                    $scope.verified = true;
                    $scope.warning = false;

                }
                else {
                    $scope.warning = true;
                }
            }
            else {
                $scope.warning = true;
            }

        }

    }
    $scope.removeFile = function (index) {
        $scope.state.attributes.output_files.splice(index, 1);
        $scope.state.attributes.checked_output_filenames.splice(index, 1);
    }
    $scope.next_step = function () {
        trackSavedProv.mark_outputs(true);
        Stater.persist($scope.state);
        $scope.state = Stater.retrieve();
        wizard.fireStep('nav_choose_upload');
    }

}