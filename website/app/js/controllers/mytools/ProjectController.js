function ListProjectsController($scope, mcapi, Stater) {
    mcapi('/projects')
        .success(function (data) {
            $scope.projects = data;
        })
        .error(function (data) {

        }).jsonp();

    $scope.clicked = function () {
        $scope.clicked = true;
    }

    $scope.selected_project = function(proj_id) {

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

    $scope.active = function(tab){
        $scope.expand = false;
        $scope.selected = tab;
        $scope.is_saved = false;
        if (tab == 'input-tab'){
            $scope.expand = true;
            $scope.state = Stater.retrieve();
            mcapi('/templates/%',$scope.state.attributes.process.template)
                .success(function(data){
                    data.model.forEach(function (item) {
                        if (item.name == 'required_conditions'){
                            $scope.required_conditions = item.value;
                        }
                    })

                })
                .error(function(){

                }).jsonp()
        }


    }
    $scope.isSelected = function(tab){
        return $scope.selected === tab;
    }

    $scope.isSubTabSelected = function(sub_tab){
        return $scope.sub_tab === sub_tab;

    }

    $scope.selected_substep = function(condition_name, $index){

        $scope.sub_tab = $index;

        $scope.condition_name = condition_name;
        var name = '"' + $scope.condition_name + '"';
        mcapi('/templates')
            .argWithValue('filter_by', '"template_name":' + name)
            .success(function (condition) {
                $scope.condition = condition[0];
            })
            .error(function () {
                alertService.sendMessage("Failed looking up: " + $scope.condition_name);
            }).jsonp();
    }



}

function ProcessStepController($scope, mcapi, watcher, Stater){
    mcapi('/templates')
        .success(function(data) {
            $scope.process_templates = data;
        })
        .error(function(data) {

        }).jsonp();

    $scope.selected_template_type = function (id) {
        mcapi('/processes/template/%', id)
            .success(function(data) {
                $scope.processes = data;

            })
            .error(function(data) {

            }).jsonp();
    }

    watcher.watch($scope, 'selected_process', function (name) {
        if (name == "new"){
            $scope.process = name;
        }
        else{
            $scope.process = JSON.parse(name);
        }
    });

    $scope.add_notes = function () {
        $scope.process.notes.push($scope.new_note);
        $scope.new_note = "";
    }
    $scope.add_error_msg = function () {
        $scope.process.runs.push({'started': $scope.start_run ,'stopped': $scope.stop_run, 'error_messages': $scope.new_err_msg});
        $scope.new_err_msg = "";
        $scope.start_run = "";
        $scope.stop_run = "";
    }

    $scope.add_citations = function(){

    }

    $scope.save_process = function(){
        //console.dir($scope.process)
        Stater.newId("setting_provenance1", "Creating provenance1", "upload1", function (status, state) {
            if (status) {
                $scope.state = state;
                $scope.state.attributes.process = {};
                $scope.process.required_conditions
                $scope.state.attributes.process = $scope.process;
                Stater.persist($scope.state);
            }
        });
    $scope.is_saved = true;
    }

}

function InputStepController($scope, mcapi, watcher, Stater){

    $scope.save = function () {
        $scope.state = Stater.retrieve();
        if (! ('input_conditions' in $scope.state.attributes)) {
            $scope.state.attributes.input_conditions = {};
            Stater.save($scope.state);
        }
        $scope.state.attributes.input_conditions[$scope.condition_name] = $scope.condition;
        console.log($scope.state)
        //Stater.save($scope.state);
    }









}


