function ListProjectsController($scope, $rootScope, trackSavedProv, mcapi, Stater, wizard, alertService, treeToggle, $state) {
    $scope.all_templates = [];

    init();
    function init() {
        mcapi('/templates')
            .success(function (data) {
                $scope.all_templates = data;
            }).jsonp();
    }

    mcapi('/projects/by_group')
        .success(function (data) {
            $scope.projects = data;
        })
        .error(function (data) {

        }).jsonp();

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


    $scope.selected_project = function (proj_id) {
        $scope.done = false;
        $scope.notdone = false;
        trackSavedProv.mark_process(false);
        $scope.process_saved = trackSavedProv.get_process_status();
        trackSavedProv.mark_inputs(false);
        $scope.inputs_saved = trackSavedProv.get_input_status();
        trackSavedProv.mark_outputs(false);
        $scope.outputs_saved = trackSavedProv.get_output_status();

        Stater.newId("prov", "create prov", "type", function (status, state) {
            if (status) {
                $scope.state = state;
                $scope.state.attributes.process = {};
                wizard.fireStep('nav_choose_process');

            }
        });

        $scope.tree_data = [];
        $scope.trail = [];
        $scope.state = Stater.retrieve();
        //$scope.state.attributes.project_id = proj_id;
        //Stater.persist($scope.state);
        $scope.selected_proj = true;
        $rootScope.project_id = proj_id;
        mcapi('/projects/%', proj_id)
            .success(function (data) {
                $scope.project_obj = data;
            })
            .error(function () {

            }).jsonp();

        $scope.loaded=false;
        mcapi('/projects/%/tree2', proj_id)
            .success(function (data) {
                console.dir(data);
                if (data[0]) {
                    //$scope.tree_data = $scope.flattenTree(data);
                    $scope.tree_data = data;
                    $scope.dir = $scope.tree_data[0].children;
                    $scope.loaded=true;
                    $scope.trail.push(data[0]);
                }
            })
            .error(function (data) {

            }).jsonp();

        mcapi('/processes/project/%', proj_id)
            .success(function (data) {
                $scope.tree_process = $scope.process_processes(data);
                //$scope.tree_process = $scope.convert_into_tree($scope.proj_processes);
                //$scope.tree_p = [{"template_description":"Collect data using an SEM.","template_name":"Run SEM","template_type":"process","template_birthtime":{"timezone":"+00:00","epoch_time":1384454393.733},"owner":"gtarcea@umich.edu","model":[{"name":"required_conditions","value":["sem_equipment_conditions","material_conditions"]},{"name":"name","value":""},{"name":"owner","value":""},{"name":"description","value":""},{"name":"birthtime","value":""},{"name":"mtime","value":""},{"name":"machine","value":""},{"name":"process_type","value":""},{"name":"version","value":""},{"name":"parent","value":""},{"name":"notes","value":[]},{"name":"inputs","value":[]},{"name":"outputs","value":[]},{"name":"runs","value":[]},{"name":"citations","value":[]},{"name":"status","value":""},{"name":"required_output_conditions","value":["material_conditions"]}],"template_mtime":{"timezone":"+00:00","epoch_time":1384454393.733},"id":"a71eecb5-f9ba-4da7-8129-5309a428bb42","c_id":"1","parent_id":""},{"name":"dfg","template":"a71eecb5-f9ba-4da7-8129-5309a428bb42","id":"91f58f49-64ca-47b0-a1b0-2084bdcf4f27","c_id":"2","parent_id":"1"},{"name":"*****Process****","template":"a71eecb5-f9ba-4da7-8129-5309a428bb42","id":"8ae9fbba-9ee5-4a7f-ad8f-d97bf08d1ab3","c_id":"3","parent_id":"1"},{"name":"light","template":"a71eecb5-f9ba-4da7-8129-5309a428bb42","id":"ae4ff8d9-0621-4e4f-b285-5b36cd1d51ed","c_id":"4","parent_id":"1"},{"name":"test 8 process************","template":"a71eecb5-f9ba-4da7-8129-5309a428bb42","id":"fafa9432-0763-412b-923e-3c7523233211","c_id":"5","parent_id":"1"},{"name":"fdg","template":"a71eecb5-f9ba-4da7-8129-5309a428bb42","id":"0a5a6e1f-bbff-4413-9bf4-9a02ee10a2f6","c_id":"6","parent_id":"1"},{"name":"gem","template":"a71eecb5-f9ba-4da7-8129-5309a428bb42","id":"4f83ce2c-07db-473c-9fbc-795f89596864","c_id":"7","parent_id":"1"},{"name":"pr -1","template":"a71eecb5-f9ba-4da7-8129-5309a428bb42","id":"bc4f1379-2fdc-4d45-b4da-8626a4516322","c_id":"8","parent_id":"1"},{"name":"qaz","template":"a71eecb5-f9ba-4da7-8129-5309a428bb42","id":"c246b768-1d08-4d56-bf2d-08622592cca0","c_id":"9","parent_id":"1"},{"name":"fantastic process","template":"a71eecb5-f9ba-4da7-8129-5309a428bb42","id":"ea1df4a0-3ee7-485f-859a-001e281a73e6","c_id":"10","parent_id":"1"}]
            })
            .error(function (data) {

            }).jsonp();
    }

    $scope.flattenTree = function (tree) {
        var flatTree = [],
            treeModel = new TreeModel(),
            root = treeModel.parse(tree[0]);
        root.walk({strategy: 'pre'}, function (node) {
            flatTree.push(node.model);
        });
        return flatTree;
    };


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
//    $scope.try_again = function () {
//        wizard.fireStep('nav_choose_upload');
//        $scope.done = false;
//        $scope.notdone = false;
//    }

}

function ProcessStepController($scope, $rootScope, trackSavedProv, mcapi, watcher, Stater, wizard) {
    mcapi('/machines')
        .success(function (data) {
            $scope.machines_list = data;

        })
        .error(function (data) {
        }).jsonp();


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
        $scope.process = {'notes': [], 'runs': [], 'citations': [], 'template': template.id };

    });

    watcher.watch($scope, 'machine_selected', function (mach) {
        machine = JSON.parse(mach)
        $scope.process.machine = machine;

    });


    $scope.add_machine_to_db = function () {
        temp = {'name': $scope.new_machine};
        mcapi('/machines/new')
            .success(function (data) {
                mcapi('/machines/%', data.id)
                    .success(function (machine_obj) {
                        $scope.process.machine = machine_obj;
                        $scope.machine_added = true
                    })
                    .error(function (e) {

                    }).jsonp();
            })
            .error(function (data) {
            }).post(temp);
    }

    $scope.add_notes = function () {
        $scope.process.notes.push($scope.new_note);
        $scope.new_note = "";
    }
    $scope.add_run = function () {
        $scope.process.runs.push({'started': $scope.start_run, 'stopped': $scope.stop_run, 'error_messages': $scope.new_err_msg});
        $scope.new_err_msg = "";
        $scope.start_run = "";
        $scope.stop_run = "";
    }

    $scope.remove_run = function (index) {
        $scope.process.runs.splice(index, 1);

    }


    $scope.add_citations = function () {
        $scope.process.citations.push($scope.new_citation);
        $scope.new_citation = "";
    }


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
            $scope.state.attributes.project_id = $rootScope.project_id;
            Stater.persist($scope.state);
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

function InputStepController($scope, trackSavedProv, mcapi, wizard, Stater, treeToggle, watcher) {
    $scope.state = Stater.retrieve();
    /**
     *
     * @param condition_name
     */

    $scope.typeOf = function(input){
        return typeof input;
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
        $scope.selected_cond = cond;
        $scope.condition.name = '';
        $scope.condition.description = cond.description
        $scope.condition.model = cond.model
        console.log($scope.condition)
        //var model = $scope.condition.model

//        model.forEach(function (property) {
//            var name = property.name;
//            var all_keys = Object.keys($scope.selected_cond)
//            if (all_keys.indexOf(name) > -1) {
//                property.value = $scope.selected_cond[name]
//            }
//
//
//        });

    }

    $scope.clear_condition = function () {
        $scope.condition.name = '';
        $scope.condition.description = '';
        $scope.condition.model.forEach(function (property) {
            property.value = '';

        });
        $scope.use_condition = '';

    }

    $scope.custom_property = function () {
        if ($scope.additional_prop || $scope.additional_prop == ' ') {
            $scope.condition.model.push({'name': $scope.additional_prop, 'value': '', 'value_choice':[],'unit': '', 'unit_choice':[],'type':''})
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

    $scope.add_input_files = function(){
        $scope.checked_ids = [];
        $scope.item_names = [];
        $scope.state = Stater.retrieve();
        if (!('input_files' in $scope.state.attributes)) {
            $scope.state.attributes.input_files = {};
            $scope.state.attributes.checked_input_filenames = {};
        }
        else{
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
        console.dir($scope.state)
        if($scope.state.attributes.process.required_conditions.length == 0){
            $scope.verified = true;
            $scope.warning = false;
        }
        else{
            if ($scope.state.attributes.input_conditions){
                if ((Object.keys($scope.state.attributes.input_conditions).length) == (($scope.state.attributes.process.required_conditions).length)){
                    $scope.verified = true;
                    $scope.warning = false;

                }
                else{
                    $scope.warning = true;
                }
            }
            else{
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

function OutputStepController($scope, trackSavedProv, mcapi, wizard, Stater, treeToggle, alertService) {


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
        $scope.selected_cond = cond;
        $scope.condition.name = '';
        $scope.condition.description = cond.description
        var model = $scope.condition.model


        model.forEach(function (property) {
            var name = property.name;
            var all_keys = Object.keys($scope.selected_cond)
            if (all_keys.indexOf(name) > -1) {
                property.value = $scope.selected_cond[name]
            }

        });

    }

    $scope.clear_condition = function () {
        $scope.condition.name = '';
        $scope.condition.description = '';
        $scope.condition.model.forEach(function (property) {
            property.value = '';

        });
        $scope.use_condition = '';

    }
    $scope.custom_property = function () {
        if ($scope.additional_prop || $scope.additional_prop == ' ') {
            $scope.condition.model.push({'name': $scope.additional_prop, 'value': ''})
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
        Stater.persist($scope.state);
    }

    /**
     * Output Files
     */
    $scope.add_output_files = function(){
        $scope.checked_ids = [];
        $scope.item_names = [];

        $scope.state = Stater.retrieve();
        if (!('output_files' in $scope.state.attributes)) {
            $scope.state.attributes.output_files = {};
            $scope.state.attributes.checked_output_filenames = {};

        }
        else{
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
        console.dir($scope.state)
        if($scope.state.attributes.process.required_output_conditions.length == 0){
            $scope.verified = true;
            $scope.warning = false;
        }
        else{
            if ($scope.state.attributes.output_conditions){
                if ((Object.keys($scope.state.attributes.output_conditions).length) == (($scope.state.attributes.process.required_output_conditions).length)){
                    $scope.verified = true;
                    $scope.warning = false;

                }
                else{
                    $scope.warning = true;
                }
            }
            else{
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


