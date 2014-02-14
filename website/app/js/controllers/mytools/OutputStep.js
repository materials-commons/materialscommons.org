function OutputSubstepChooseFilesController($scope, Stater, pubsub, Projects) {
    $scope.showDetails = false;
    var channel = 'choose.outputs.files';
    $scope.outputFiles = [];

    $scope.show = function() {
        $scope.showDetails = !$scope.showDetails;
        if ($scope.showDetails) {
            Projects.setChannel(channel);
        } else {
            Projects.setChannel(null);
        }
    };

    pubsub.waitOn($scope, channel, function(fileentry) {
        console.log("waitOn fileentry selected = " + fileentry.selected);
        if (fileentry.selected) {
            $scope.outputFiles.push(fileentry);
        } else {
            var i = $scope.indexOfFile(fileentry.id);
            if (i != -1) {
                $scope.outputFiles.splice(i, 1);
            }
        }
    });

    $scope.removeFile = function(index) {
        $scope.outputFiles[index].selected = false;
        $scope.outputFiles.splice(index, 1);
    };

    $scope.indexOfFile = function(id) {
        for(var i = 0; i < $scope.outputFiles.length; i++) {
            if ($scope.outputFiles[i].id == id) {
                return i;
            }
        }
        return -1;
    };

    $scope.saveFiles = function() {
        var state = Stater.retrieve();

    };
}

function OutputStepController($scope, trackSavedProv, mcapi, wizard, Stater, treeToggle, alertService, $dialog, watcher) {

    $scope.useExisting = "yes";
    $scope.state = Stater.retrieve();

    mcapi('/materials')
        .success(function (data) {
            $scope.materials = data;
        })
        .error(function () {

        }).jsonp()

    $scope.material_select = function (material) {
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

    /*
     ** Filter out the samples a user can choose based on the material they are using. Since samples
     ** can come from different materials, we only want to show the samples for the chosen material.
     */
    watcher.watch($scope, 'condition.material', function (value) {
        var filteredConditions = _.filter($scope.all_conditions, function (item) {
            if (item.material.id == $scope.condition.material.id) {
                return item;
            }
        });
        $scope.existing_conditions = filteredConditions;
    });

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
                        // Save for later filtering of items to present
                        // See watcher.watch on condition.material above.
                        $scope.all_conditions = data;
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