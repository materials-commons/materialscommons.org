function ListProjectsController($scope, mcapi, Stater, wizard, watcher, treeToggle) {
    mcapi('/projects')
        .success(function (data) {
            $scope.projects = data;
        })
        .error(function (data) {

        }).jsonp();

    $scope.clicked = function () {
        $scope.clicked = true;
    }
    $scope.selected_project = function (proj_id) {

        mcapi('/projects/%/tree', proj_id)
            .success(function (data) {
                $scope.tree_data = $scope.flattenTree(data);

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

    var steps = {
        step: 'nav_choose_process',
        children: [
            {step: 'nav_choose_inputs'},
            {step: 'nav_choose_outputs'},
            {step: 'nav_upload'}
        ]
    };

    wizard.setSteps(steps);


    Stater.newId("setting_provenance1", "Creating provenance1", "upload1", function (status, state) {
        if (status) {
            $scope.state = state;
            $scope.state.attributes.process = {};
            wizard.fireStep('nav_choose_process');

        }
    });

    $scope.setCurrentStep = function (step) {
        if (step == 'nav_choose_process') {
            wizard.fireStep(step);
        } else if (step == 'nav_choose_inputs' || step == 'nav_choose_outputs') {
            wizard.fireStepAfter(step);
        } else if (!wizard.isAfterCurrentStep(step)) {
            wizard.fireStep(step);
        }
    }

    $scope.isCurrentStep = function (step) {
        return wizard.currentStep() == step;
    }

    $scope.check = function (id){
        $scope.checked_items  = treeToggle.get_all_checked_items();

        if ($scope.checked_items.indexOf(id) >= 0){
            treeToggle.pop_checked_item(id);
        }
        else{
            treeToggle.add_checked_item(id);
        }
    }

    $scope.isChecked = function (id) {
        if (_.contains($scope.checked_items, id)) {
            return true;
        }
        return false;
    };


}

function ProcessStepController($scope, mcapi, watcher, Stater, wizard) {
    $scope.customnote = true;
    $scope.customruns = true;
    $scope.customcitations = true;


    wizard.waitOn($scope, 'nav_choose_process', function () {
        $scope.state = Stater.retrieve();

        if ('process' in $scope.state.attributes) {
            $scope.process = $scope.state.attributes.process;
        }

        mcapi('/templates')
            .argWithValue('filter_by', '"template_type":"process"')
            .success(function (processes) {
                $scope.process_templates = processes;
            })
            .error(function () {
                alertService.sendMessage("Unable to retrieve processes from database.");
            }).jsonp();
    });


    $scope.selected_template_type = function (id) {
        mcapi('/processes/template/%', id)
            .success(function (data) {
                $scope.processes = data;

            })
            .error(function (data) {

            }).jsonp();
    }

    watcher.watch($scope, 'process_type', function (template) {
        template = JSON.parse(template)
        template.model.forEach(function (item) {
            if (item.name == "required_conditions") {
                $scope.required_input_conditions = item.value;
            }
            else if(item.name == "required_output_conditions"){
                $scope.required_output_conditions = item.value;
            }

        })

    });

    watcher.watch($scope, 'selected_process', function (name) {
        if (name == "new") {
              $scope.process = {'notes': [], 'runs': [], 'citations': [] };
        }
        else {
            $scope.process = JSON.parse(name);
        }

    });

    $scope.add_notes = function () {
        $scope.process.notes.push($scope.new_note);
        $scope.new_note = "";
    }
    $scope.add_error_msg = function () {
        $scope.process.runs.push({'started': $scope.start_run, 'stopped': $scope.stop_run, 'error_messages': $scope.new_err_msg});
        $scope.new_err_msg = "";
        $scope.start_run = "";
        $scope.stop_run = "";
    }

    $scope.add_citations = function () {
        $scope.process.citations.push($scope.new_citation);
        $scope.new_citation = "";
    }

    $scope.save_process = function () {
        $scope.process.required_conditions = $scope.required_input_conditions;
        $scope.process.required_output_conditions = $scope.required_output_conditions;
        $scope.is_saved = true;
    }

    $scope.next_step = function () {
        /*
         * Add in new wizard steps for the conditions and files
         */
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

        $scope.state.attributes.process = $scope.process;
        Stater.persist($scope.state);

        wizard.fireNextStep();
    }

}

function InputStepController($scope, mcapi, wizard, Stater, treeToggle) {

    /**
     *
     * @param condition_name
     */
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
                    .error(function(e){
                    }).jsonp();
            })
            .error(function () {
                alertService.sendMessage("Failed looking up: " + $scope.condition_name);
            }).jsonp();
    }

    $scope.selected_condition = function(cond){
        $scope.selected_cond = cond;
        var model =   $scope.condition.model


       model.forEach(function(property){
            var name =  property.name;
            var all_keys = Object.keys($scope.selected_cond)
            if(all_keys.indexOf(name) > -1){
                property.value =   $scope.selected_cond[name]
            }

        });

    }

    wizard.waitOn($scope, $scope.condition_name, function () {
        $scope.state = Stater.retrieve();
        if ('input_conditions' in $scope.state.attributes) {
            if ($scope.condition_name in $scope.state.attributes.input_conditions) {
                $scope.condition = $scope.state.attributes.input_conditions[$scope.condition_name];
            }
        } else {
            $scope.state.attributes.input_conditions = {};
        }
    });

    $scope.save_condition = function(){
        $scope.state = Stater.retrieve();
        if (! ('input_conditions' in $scope.state.attributes)) {
            $scope.state.attributes.input_conditions = {};
            Stater.save($scope.state);
        }
        $scope.state.attributes.input_conditions[$scope.condition_name] = $scope.condition;
        Stater.save($scope.state);
        $scope.showDetails= false;
    }


    $scope.next_step = function(){
        Stater.persist($scope.state);
        wizard.fireStep('nav_choose_outputs');

    }
    /**
     * Input Files
     */
    $scope.save_selected_input_files = function(){
        $scope.checked_items  = treeToggle.get_all_checked_items();
        treeToggle.uncheck_all_items()
        $scope.state = Stater.retrieve();
        if (! ('input_files' in $scope.state.attributes)) {
            $scope.state.attributes.input_files = {};
            Stater.save($scope.state);
        }

        $scope.state.attributes.input_files = $scope.checked_items;
        Stater.save($scope.state);
        $scope.added = true;
    }

}

function OutputStepController($scope, mcapi, wizard, Stater, treeToggle,alertService){

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
                    .error(function(e){
                    }).jsonp();
            })
            .error(function () {
                alertService.sendMessage("Failed looking up: " + $scope.condition_name);
            }).jsonp();
    }

    $scope.selected_condition = function(cond){
        $scope.selected_cond = cond;
        var model =   $scope.condition.model


        model.forEach(function(property){
            var name =  property.name;
            var all_keys = Object.keys($scope.selected_cond)
            if(all_keys.indexOf(name) > -1){
                property.value =   $scope.selected_cond[name]
            }

        });

    }

    wizard.waitOn($scope, $scope.condition_name, function () {
        $scope.state = Stater.retrieve();
        if ('output_conditions' in $scope.state.attributes) {
            if ($scope.condition_name in $scope.state.attributes.output_conditions) {
                $scope.condition = $scope.state.attributes.output_conditions[$scope.condition_name];
            }
        } else {
            $scope.state.attributes.output_conditions = {};
        }
    });

    $scope.save_condition = function(){
        $scope.state = Stater.retrieve();
        if (! ('output_conditions' in $scope.state.attributes)) {
            $scope.state.attributes.output_conditions = {};
            Stater.save($scope.state);
        }
        $scope.state.attributes.output_conditions[$scope.condition_name] = $scope.condition;
        Stater.save($scope.state);
        $scope.showDetails= false;
    }


    $scope.next_step = function(){
        Stater.persist($scope.state);
        wizard.fireStep('nav_choose_outputs');

    }

    /**
     * Output Files
     */
    $scope.save_selected_output_files = function(){
        $scope.checked_items  = treeToggle.get_all_checked_items();

        $scope.state = Stater.retrieve();
        if (! ('output_files' in $scope.state.attributes)) {
            $scope.state.attributes.output_files = {};
            Stater.save($scope.state);
        }

        $scope.state.attributes.output_files = $scope.checked_items;
        console.dir($scope.state)

        Stater.save($scope.state);
        $scope.added = true;
    }

}


