function ProjectEditController($scope, $rootScope, Projects, trackSavedProv, watcher, mcapi, Stater, wizard, alertService, treeToggle, $stateParams, $state) {
    $scope.all_templates = [];
    $scope.model = Projects.model;

    init();
    function init() {
        mcapi('/templates')
            .success(function (data) {
                $scope.all_templates = data;
            }).jsonp();
    }

    $scope.openFolder = function (item) {
        var e = _.find($scope.trail, function (item1) {
            return item1.id === item.id;
        });

        if (typeof e === 'undefined') {
            // first level is 0 so we need to add 1 to our test
            if (item.level + 1 <= $scope.trail.length) {
                // Remove everything at this level and above
                $scope.trail = $scope.trail.splice(0, item.level);
            }
            $scope.trail.push(item);
        }

        $scope.dir = item.children;
    }

    $scope.backToFolder = function (item) {
        $scope.dir = item.children;
    }

    if ($stateParams.state_id !== "") {
        console.log("state_id:" + $stateParams.state_id);
        Stater.retrieveRemote($stateParams.state_id, function (status, data) {
            if (status) {
                console.log("Retrieved the state!")
                Stater.save(data);
                $scope.state = Stater.retrieve();
                $scope.add_to = 'prov';
                wizard.fireStep('nav_choose_process');
            }
        })
    }

    watcher.watch($scope, 'add_to', function (choice) {
        if (choice === "prov") {
            Stater.newId("prov", "create prov", "", function (status, state) {
                if (status) {
                    $scope.state = state;
                    $scope.state.attributes.process = {};
                    wizard.fireStep('nav_choose_process');
                }
            });
        }
    });

    $scope.selected_project = function (proj_id) {
        $scope.done = false;
        $scope.notdone = false;
        trackSavedProv.mark_process(false);
        $scope.process_saved = trackSavedProv.get_process_status();
        trackSavedProv.mark_inputs(false);
        $scope.inputs_saved = trackSavedProv.get_input_status();
        trackSavedProv.mark_outputs(false);
        $scope.outputs_saved = trackSavedProv.get_output_status();

        $scope.tree_data = [];
        $scope.trail = [];
        $scope.selected_proj = true;
        $rootScope.project_id = proj_id;
        mcapi('/projects/%', proj_id)
            .success(function (data) {
                $scope.project_obj = data;
            })
            .error(function () {

            }).jsonp();

        $scope.loaded = false;
        if (!(proj_id in $scope.model.projects)) {
            mcapi('/projects/%/tree2', proj_id)
                .success(function (data) {
                    if (data[0]) {
                        $scope.tree_data = data;
                        $scope.dir = $scope.tree_data[0].children;
                        var obj = {};
                        obj.dir = $scope.dir;
                        $scope.model.projects[proj_id] = obj;
                        $scope.loaded = true;
                        $scope.trail.push(data[0]);
                    }
                })
                .error(function (data) {

                }).jsonp();
        } else {
            $scope.loaded = true;
            $scope.dir = $scope.model.projects[proj_id].dir;
        }

        mcapi('/processes/project/%', proj_id)
            .success(function (data) {
                $scope.tree_process = $scope.process_processes(data);
            })
            .error(function (data) {

            }).jsonp();
    }

    $scope.selected_project($stateParams.id);

    $scope.process_processes = function (processes) {
        $scope.temp_proc = {};
        $scope.tree_p = [];
        processes.forEach(function (pr) {
            var temp = pr.template
            if (temp in $scope.temp_proc) {
                $scope.temp_proc[temp].push(pr);
            }
            else {
                $scope.temp_proc[temp] = new Array();
                $scope.temp_proc[temp].push(pr);
            }

        })
        //return $scope.temp_proc

        $scope.tree_p = $scope.convert_into_tree($scope.temp_proc);
        return $scope.tree_p
    }

    $scope.convert_into_tree = function (data) {
        $scope.tree = [];
        var count = 0;
        var processes = data;
        var all_templates = Object.keys(data);
        var new_templates = all_templates.filter(function (v) {
            return v !== ''
        });
        new_templates.forEach(function (d) {
            var template_name = '';
            $scope.all_templates.forEach(function (item) {
                if (item.id == d) {
                    template_name = item.template_name;
                }
            })
            var template = {"id": d, "name": template_name};
            count = count + 1;
            template['c_id'] = count.toString();
            template['parent_id'] = '';
            $scope.tree.push(template);
            var list_processes = processes[d]
            $scope.tree, count = $scope.iterate_process(count, list_processes, template, $scope.tree)
        });
        return $scope.tree
    }


    $scope.iterate_process = function (count, data, template, tree) {
        data.forEach(function (pr) {
            count = count + 1;
            pr['c_id'] = count.toString();
            pr['parent_id'] = template.c_id;
            tree.push(pr);
        });
        return tree, count
    }


    var steps = {
        step: 'nav_choose_process',
        children: [
            {step: 'nav_choose_inputs'},
            {step: 'nav_choose_outputs'},
            {step: 'nav_choose_upload'}
        ]
    };

    wizard.setSteps(steps);

    $scope.isCurrentStep = function (step) {
        $scope.process_saved = trackSavedProv.get_process_status();
        $scope.inputs_saved = trackSavedProv.get_input_status();
        $scope.outputs_saved = trackSavedProv.get_output_status();

        return wizard.currentStep() == step;

    }

    $scope.process_saved = trackSavedProv.get_process_status();
    $scope.inputs_saved = trackSavedProv.get_input_status();
    $scope.outputs_saved = trackSavedProv.get_output_status();


    $scope.check = function (t) {
        $scope.checked_items = treeToggle.get_all_checked_items();
        if (t.type == 'datafile') {
            if ($scope.checked_items.indexOf(t) >= 0) {
                treeToggle.pop_checked_item(t);
            }
            else {
                treeToggle.add_checked_item(t);
            }
        }

    }

    $scope.isChecked = function (id) {
        if (_.contains($scope.checked_items, id)) {
            return true;
        }
        return false;
    };

    $scope.upload_state = function () {
        $scope.inputs_saved = false;
        $scope.state = Stater.retrieve();
        mcapi('/upload')
            .success(function (data) {
                $scope.done = true;
                $scope.process_id = data.process;
                Stater.clear();
                $scope.state = Stater.retrieve();
                alertService.sendMessage("Your Provenance was Created Successfully.")

            })
            .error(function () {
                $scope.notdone = true;
                //Stater.clear();
                $scope.state = Stater.retrieve();
                alertService.sendMessage("Sorry - Your Provenance upload failed.");
            })
            .post({state_id: $scope.state.id})

    }

    $scope.cancel_provenance = function () {
        Stater.clear();
        $state.transitionTo('mytools');

    }

    $scope.report = function () {
        $scope.showreport = true
        mcapi('/project/provenance/%', $scope.project_obj[0].id)
            .success(function (data) {
                $scope.data = data;
            })
            .error(function (e) {
                alert('no')
            }).jsonp();

    }

    $scope.remove_instructions = function () {
        $scope.display = true
    }
}

function ProcessStepController($scope, $rootScope, trackSavedProv, mcapi, watcher, pubsub, Stater, wizard, alertService) {

    $scope.myradio = 'select';

    mcapi('/machines')
        .success(function (data) {
            $scope.machines_list = data;
        })
        .error(function (data) {
        }).jsonp();

    mcapi('/templates')
        .argWithValue('filter_by', '"template_type":"machine"')
        .success(function (data) {
            $scope.machine_template = data[0];
        })
        .error(function (e) {

        }).jsonp()


    mcapi('/templates')
        .argWithValue('filter_by', '"template_type":"process"')
        .success(function (processes) {
            $scope.process_templates = processes;
        })
        .error(function () {
            alertService.sendMessage("Unable to retrieve processes from database.");
        }).jsonp();

    wizard.waitOn($scope, 'nav_choose_process', function () {
        $scope.state = Stater.retrieve();
        if ('process' in $scope.state.attributes) {
            $scope.process = $scope.state.attributes.process;
        }

    });


    watcher.watch($scope, 'process_type', function (template) {
        template = JSON.parse(template)
        template.model.forEach(function (item) {
            if (item.name == "required_conditions") {
                $scope.required_input_conditions = item.value;
            }
            else if (item.name == "required_output_conditions") {
                $scope.required_output_conditions = item.value;
            }
            else if (item.name == "required_input_files") {
                $scope.required_input_files = item.value;
            }
            else if (item.name == "required_output_files") {
                $scope.required_output_files = item.value;
            }

        })
        var now = new Date();
        var dd = ("0" + now.getDate()).slice(-2);
        var mm = ("0" + (now.getMonth() + 1)).slice(-2);
        var today = now.getFullYear() + "-" + (mm) + "-" + (dd);
        var make_name = template.template_name + ':' + today
        $scope.process = {'name': make_name, 'notes': [], 'runs': [], 'citations': [], 'template': template.id, 'machine': {'model': []} };
    });

    $scope.add_property_to_machine = function () {
        if (!('model' in $scope.process.machine)) {
            $scope.process.machine.model = {};
        }
        if ($scope.p_name || $scope.p_name == ' ') {
            $scope.process.machine.model.push({'name': $scope.p_name, 'value': ''});
        }

    }
    $scope.custom_property = function () {
        if ($scope.additional_prop || $scope.additional_prop == ' ') {
            $scope.process.machine.model.push({'name': $scope.additional_prop, 'value': ''})
        }

    }


    $scope.machine_select = function () {
        machine = JSON.parse($scope.machine_selected)
        $scope.process.machine = machine;
    }

    $scope.clear_machine = function () {
        $scope.process.machine = {'model': []};
        $scope.machine_added = false;
    }
//    $scope.clear_machine = function () {
//        $scope.process.machine = {};
//
//    }
//

    $scope.add_machine_to_db = function () {
        var temp = $scope.process.machine;
        mcapi('/machines/new')
            .success(function (data) {
                mcapi('/machines/%', data.id)
                    .success(function (machine_obj) {
                        $scope.process.machine = machine_obj;
                        $scope.show_machine = $scope.process.machine.name;
                        $scope.machine_added = true;
                        $scope.myradio = 'select';
                    })
                    .error(function (e) {

                    }).jsonp();
            })
            .error(function (e) {

            }).post(temp);
    };

    $scope.add_notes = function () {
        $scope.process.notes.push($scope.new_note);
        $scope.new_note = "";
    };

    $scope.add_run = function () {
        $scope.process.runs.push({'started': $scope.start_run, 'stopped': $scope.stop_run, 'error_messages': $scope.new_err_msg});
        $scope.new_err_msg = "";
        $scope.start_run = "";
        $scope.stop_run = "";
    };

    $scope.remove_run = function (index) {
        $scope.process.runs.splice(index, 1);

    };

    $scope.add_citations = function () {
        $scope.process.citations.push($scope.new_citation);
        $scope.new_citation = "";
    };

    $scope.save_process = function () {
        trackSavedProv.mark_process(true);
        $scope.process.required_conditions = $scope.required_input_conditions;
        $scope.process.required_output_conditions = $scope.required_output_conditions;
        $scope.process.required_input_files = $scope.required_input_files;
        $scope.process.required_output_files = $scope.required_output_files;

        $scope.process.required_conditions.forEach(function (condition) {
            var s = {step: condition};
            wizard.addStep('nav_choose_inputs', s);
        });
        wizard.addStep('nav_choose_inputs', {step: 'nav_input_files'});

        $scope.process.required_output_conditions.forEach(function (cond) {
            var s = {step: cond};
            wizard.addStep('nav_choose_outputs', s);
        });
        wizard.addStep('nav_choose_outputs', {step: 'nav_output_files'});
        if ($scope.state) {
            $scope.state.attributes.process = $scope.process;
            if ($scope.process.machine) {
                $scope.state.attributes.machine_obj = $scope.process.machine;
                $scope.state.attributes.process.machine = $scope.process.machine.id
            }

            $scope.state.name = $scope.process.name;
            $scope.state.description = $scope.process.description;
            $scope.state.attributes.project_id = $rootScope.project_id;
            Stater.persist($scope.state, function () {
                pubsub.send('drafts.update', '');
            });
            $scope.project_warning = false;
            wizard.fireStep('nav_choose_inputs');

        }
        else {
            $scope.project_warning = true;
        }


    }

    $scope.edit_process = function () {
        wizard.fireStep('nav_choose_process');
    }


}

function InputStepController($scope, trackSavedProv, mcapi, wizard, Stater, treeToggle, watcher, $dialog, $rootScope) {
    $rootScope.checked = false;
    $scope.state = Stater.retrieve();
    /**
     *
     * @param condition_name
     */
    $scope.loadMaterials = function () {
        mcapi('/materials')
            .success(function (data) {
                $scope.materials = data;
            })
            .error(function () {

            }).jsonp();
    }

    $scope.loadMaterials();

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
                $scope.loadMaterials();
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
        $scope.condition.name = make_name;
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
        //$scope.condition.material = '';
    }

    $scope.custom_property = function () {
        if ($scope.additional_prop || $scope.additional_prop == ' ') {
            $scope.condition.model.push({'name': $scope.additional_prop, 'value': '', 'value_choice': [], 'unit': '', 'unit_choice': [], 'type': ''})
        }

    }


    $scope.save_condition = function () {
        $scope.state = Stater.retrieve();
        if (!('input_conditions' in $scope.state.attributes)) {
            $scope.state.attributes.input_conditions = {};
            Stater.save($scope.state);
        }
        $scope.state.attributes.input_conditions[$scope.condition_name] = $scope.condition;
        Stater.save($scope.state);
        $scope.showDetails = false;
    }


    $scope.next_step = function () {
        trackSavedProv.mark_inputs(true);
        Stater.persist($scope.state);
        $scope.state = Stater.retrieve();

        wizard.fireStep('nav_choose_outputs');

    }
    /**
     * Input Files
     */

    $scope.add_input_files = function () {
        $rootScope.checked = false;
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
        if (!('input_files' in $scope.state.attributes)) {
            $scope.state.attributes.input_files = {};
            $scope.state.attributes.checked_input_filenames = {};
        }
        else {
            $scope.checked_ids = $scope.state.attributes.input_files;
            $scope.item_names = $scope.state.attributes.checked_input_filenames;
        }

        $scope.checked_items = treeToggle.get_all_checked_items();

        $scope.checked_items.forEach(function (item) {
            if (!($scope.checked_ids.indexOf(item.id) > -1)) {
                $scope.checked_ids.push(item.id)
                $scope.item_names.push(item)
            }

        })

        $scope.state.attributes.input_files = $scope.checked_ids;
        //to display names of the files in verify and submit
        $scope.state.attributes.checked_input_filenames = $scope.item_names;
        Stater.save($scope.state);
    }


    $scope.verify_inputs = function () {
        $scope.state = Stater.retrieve();
        if ($scope.state.attributes.process.required_conditions.length == 0) {
            $scope.verified = true;
            $scope.warning = false;
        }
        else {
            if ($scope.state.attributes.input_conditions) {
                if ((Object.keys($scope.state.attributes.input_conditions).length) == (($scope.state.attributes.process.required_conditions).length)) {
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
        $scope.state.attributes.input_files.splice(index, 1);
        $scope.state.attributes.checked_input_filenames.splice(index, 1);
    }
    $scope.edit_input = function () {
        wizard.fireStep('nav_choose_inputs');
    }


}

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
    $scope.edit_output = function () {
        wizard.fireStep('nav_choose_outputs');
    }
}

function UploadStepController($scope, wizard, Stater, mcapi) {

    wizard.waitOn($scope, 'nav_choose_upload', function () {
        $scope.state = Stater.retrieve();
    });

    $scope.get_file = function (file) {
        $scope.jet = file;
        mcapi('/datafile/%', $scope.jet.id)
            .success(function (data) {
                $scope.datafile = data;
                $scope.setupAccessToUserFile();
            })
            .error(function (e) {

            }).jsonp();
    }

    $scope.get_mode_condition = function (file) {
        $scope.jet = file;
        $scope.model = $scope.jet.model;

    }

    $scope.setupAccessToUserFile = function () {
        $scope.fileType = determineFileType($scope.datafile.mediatype);
        $scope.fileSrc = filePath($scope.fileType, $scope.datafile.mediatype, $scope.datafile.location, $scope.datafile.name);
        $scope.originalFileSrc = originalFilePath($scope.datafile.location, $scope.datafile.name);
        $scope.fileName = $scope.datafile.name;
    }

}


