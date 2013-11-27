function ListProjectsController($scope, mcapi) {
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
        $scope.selected = tab;

    }
    $scope.isSelected = function(tab){
        return $scope.selected === tab;
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
        console.dir($scope.process)
        Stater.newId("setting_provenance1", "Creating provenance1", "upload1", function (status, state) {
            if (status) {
                $scope.state = state;
                $scope.state.attributes.process = {};
                $scope.state.attributes.process = $scope.process;
                Stater.persist($scope.state);
            }
        });
    $scope.is_saved = true;
    }

}


